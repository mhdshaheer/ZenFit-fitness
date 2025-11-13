import { inject, injectable } from "inversify";
import { IBooking } from "../../models/booking.model";
import { IBookingRepository } from "../../repositories/interface/booking.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { IBookingService } from "../interface/booking.service.interface";
import { ISlotRepository } from "../../repositories/interface/slot.repository.interface";

@injectable()
export class BookingService implements IBookingService {
  @inject(TYPES.BookingRepository)
  private readonly _bookingRepository!: IBookingRepository;
  @inject(TYPES.SlotRepository)
  private readonly _slotRepository!: ISlotRepository;
  async createBooking(
    slotId: string,
    userId: string,
    day: string,
    date: Date
  ): Promise<IBooking> {
    const slot = await this._slotRepository.findSlotById(slotId);
    if (!slot) throw new Error("Slot not found");
    const booking = await this._bookingRepository.createBooking(
      userId,
      day,
      date,
      slot
    );
    return booking;
  }

  async getMyBookings(userId: string, programId?: string): Promise<any[]> {
    const bookings = await this._bookingRepository.getMyBookings(userId, programId);
    
    // Transform the data to match frontend interface
    return bookings.map((booking: any) => ({
      _id: booking._id,
      slotId: booking.slotId,
      userId: booking.userId,
      programId: booking.slotDetails?.programId,
      day: booking.day,
      date: booking.date,
      startTime: booking.slotDetails?.startTime,
      endTime: booking.slotDetails?.endTime,
      status: booking.status === 'booked' ? 'confirmed' : booking.status,
      createdAt: booking.createdAt,
    }));
  }

  async getTrainerBookings(trainerId: string): Promise<any[]> {
    const bookings = await this._bookingRepository.getTrainerBookings(trainerId);
    return bookings;
  }

  async getAffectedUsersForSlotUpdate(slotId: string): Promise<IBooking[]> {
    const bookings = await this._bookingRepository.getBookingsBySlotId(slotId);
    return bookings;
  }

  async cancelBookingsForSlotUpdate(slotId: string): Promise<IBooking[]> {
    const cancelledBookings = await this._bookingRepository.cancelBookingsBySlotId(slotId);
    return cancelledBookings;
  }
}
