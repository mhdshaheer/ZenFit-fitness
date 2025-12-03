import { inject, injectable } from "inversify";
import { IBooking } from "../../models/booking.model";
import { IBookingRepository } from "../../repositories/interface/booking.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { IBookingService } from "../interface/booking.service.interface";
import { ISlotInstanceRepository } from "../../repositories/interface/slotInstance.repository.interface";
import { IProgramRepository } from "../../repositories/interface/program.repository.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";

@injectable()
export class BookingService implements IBookingService {
  @inject(TYPES.BookingRepository)
  private readonly _bookingRepository!: IBookingRepository;
  @inject(TYPES.SlotInstanceRepository)
  private readonly _slotInstanceRepository!: ISlotInstanceRepository;
  @inject(TYPES.ProgramRespository)
  private readonly _programRepository!: IProgramRepository;

  async createBooking(slotInstanceId: string, userId: string): Promise<IBooking> {
    const slotInstance = await this._slotInstanceRepository.findById(slotInstanceId);
    if (!slotInstance) {
      throw new AppError("Slot instance not found", HttpStatus.NOT_FOUND);
    }

    if (slotInstance.status !== "OPEN") {
      throw new AppError("Slot instance is not open for booking", HttpStatus.BAD_REQUEST);
    }

    const existingBooking = await this._bookingRepository.findActiveBookingByUserAndSlot(
      userId,
      slotInstanceId
    );

    if (existingBooking) {
      throw new AppError("You have already booked this slot", HttpStatus.CONFLICT);
    }

    const overlapping = await this._bookingRepository.findActiveBookingsForUserOnDate(
      userId,
      slotInstance.date
    );

    const newStart = this.timeToMinutes(slotInstance.startTime);
    const newEnd = this.timeToMinutes(slotInstance.endTime);
    const overlaps = overlapping.some((booking) => {
      const { startMinutes, endMinutes } = booking.snapshot;
      return startMinutes < newEnd && newStart < endMinutes;
    });

    if (overlaps) {
      throw new AppError("Booking overlaps with an existing session", HttpStatus.CONFLICT);
    }

    const capacityResult = await this._slotInstanceRepository.decrementCapacityAtomically(
      slotInstanceId
    );

    if (!capacityResult) {
      throw new AppError("Slot is full or closed", HttpStatus.BAD_REQUEST);
    }

    const program = await this._programRepository.findProgramById(
      slotInstance.programId.toString()
    );

    const day = this.getDayOfWeek(slotInstance.date);
    const snapshot = {
      slotDate: slotInstance.date,
      startTime: slotInstance.startTime,
      endTime: slotInstance.endTime,
      startMinutes: newStart,
      endMinutes: newEnd,
      timezone: slotInstance.timezone,
      programId: slotInstance.programId,
      trainerId: slotInstance.trainerId,
      templateId: slotInstance.templateId,
      capacity: slotInstance.capacity,
      programTitle: program?.title,
      programDuration: program?.duration,
      programDifficulty: program?.difficultyLevel,
    } as any;

    try {
      const booking = await this._bookingRepository.createBooking({
        slotId: slotInstanceId,
        templateId: slotInstance.templateId.toString(),
        userId,
        day,
        date: slotInstance.date,
        snapshot,
      });

      return booking;
    } catch (error) {
      await this._slotInstanceRepository.incrementCapacity(slotInstanceId);
      throw error;
    }
  }

  async getMyBookings(userId: string, programId?: string): Promise<any[]> {
    const bookings = await this._bookingRepository.getMyBookings(userId, programId);

    // Transform the data to match frontend interface
    return bookings.map((booking: any) => ({
      _id: booking._id,
      slotId: booking.slotId,
      userId: booking.userId,
      programId: booking.snapshot?.programId,
      day: booking.day,
      date: this.formatDateOnly(booking.snapshot?.slotDate),
      startTime: booking.snapshot?.startTime,
      endTime: booking.snapshot?.endTime,
      status: booking.status === 'booked' ? 'confirmed' : booking.status,
      createdAt: booking.createdAt,
      feedback: booking.feedback,
      snapshot: booking.snapshot,
    }));
  }

  async getTrainerBookings(trainerId: string): Promise<any[]> {
    const bookings = await this._bookingRepository.getTrainerBookings(trainerId);

    return bookings.map((session: any) => ({
      ...session,
      date: this.formatDateOnly(session.date),
    }));
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map((value) => parseInt(value, 10));
    return hours * 60 + minutes;
  }

  private getDayOfWeek(date: Date): string {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  }

  private formatDateOnly(date?: Date | string): string | null {
    if (!date) {
      return null;
    }

    const parsed = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString().split('T')[0];
  }
}
