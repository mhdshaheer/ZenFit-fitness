import { Request, Response } from "express";
import { IBooking } from "../../models/booking.model";
import { IBookingController } from "../interface/booking.controller.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IBookingService } from "../../services/interface/booking.service.interface";
import { INotificationService } from "../../services/interface/notification.service.interface";
import { ISlotInstanceRepository } from "../../repositories/interface/slotInstance.repository.interface";

@injectable()
export class BookingController implements IBookingController {
  @inject(TYPES.BookingService)
  private readonly _bookingService!: IBookingService;
  @inject(TYPES.NotificationService)
  private readonly _notificationService!: INotificationService;
  @inject(TYPES.SlotInstanceRepository)
  private readonly _slotInstanceRepository!: ISlotInstanceRepository;
  async createBooking(
    req: Request,
    res: Response
  ): Promise<Response<IBooking>> {
    const { slotInstanceId } = req.body;
    const userId = (req as any).user?.id;

    if (!slotInstanceId || !userId) {
      throw new AppError("Missing required fields", HttpStatus.BAD_REQUEST);
    }

    const booking = await this._bookingService.createBooking(
      slotInstanceId,
      userId
    );

    const slotInstance = await this._slotInstanceRepository.findById(slotInstanceId);
    if (!slotInstance) {
      throw new AppError("Slot instance not found", HttpStatus.NOT_FOUND);
    }

    await this._notificationService.createNotification(
      slotInstance.trainerId.toString(),
      "trainer",
      "New Slot Booking",
      `A user booked a session on ${slotInstance.date.toDateString()} at ${slotInstance.startTime}.`
    );

    // await this._notificationService.createNotification(
    //   adminId,
    //   "admin",
    //   "New Slot Booking Alert",
    //   `User ${userName} booked a slot with trainer ${trainerName}.`
    // );

    return res.status(HttpStatus.OK).json(booking);
  }

  async getMyBookings(req: Request, res: Response): Promise<Response<any>> {
    const userId = (req as any).user?.id;
    const { programId } = req.query;

    if (!userId) {
      throw new AppError("User not authenticated", HttpStatus.UNAUTHORIZED);
    }

    const bookings = await this._bookingService.getMyBookings(
      userId,
      programId as string | undefined
    );

    return res.status(HttpStatus.OK).json(bookings);
  }

  async getTrainerBookings(req: Request, res: Response): Promise<Response<any>> {
    const trainerId = (req as any).user?.id;

    if (!trainerId) {
      throw new AppError("Trainer not authenticated", HttpStatus.UNAUTHORIZED);
    }

    const bookings = await this._bookingService.getTrainerBookings(trainerId);

    return res.status(HttpStatus.OK).json(bookings);
  }
}
