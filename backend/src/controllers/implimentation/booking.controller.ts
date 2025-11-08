import { Request, Response } from "express";
import { IBooking } from "../../models/booking.model";
import { IBookingController } from "../interface/booking.controller.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IBookingService } from "../../services/interface/booking.service.interface";
import { INotificationService } from "../../services/interface/notification.service.interface";
import { ISlotService } from "../../services/interface/slot.service.interface";

export class BookingController implements IBookingController {
  @inject(TYPES.BookingService)
  private readonly _bookingService!: IBookingService;
  @inject(TYPES.NotificationService)
  private readonly _notificationService!: INotificationService;
  @inject(TYPES.SlotService)
  private readonly _slotService!: ISlotService;
  async createBooking(
    req: Request,
    res: Response
  ): Promise<Response<IBooking>> {
    const { slotId, day, date } = req.body;
    const userId = (req as any).user?.id;

    if (!slotId || !userId || !day || !date) {
      throw new AppError("Missing required fields", HttpStatus.BAD_REQUEST);
    }

    const booking = await this._bookingService.createBooking(
      slotId,
      userId,
      day,
      new Date(date)
    );

    const currentSlot = await this._slotService.getSlotBySlotId(slotId);
    if (!currentSlot) {
      throw new AppError("Slot not found", HttpStatus.NOT_FOUND);
    }

    await this._notificationService.createNotification(
      currentSlot.trainerId.toString(),
      "trainer",
      "New Slot Booking",
      `User booked a slot for "${currentSlot.programId.title}" on ${currentSlot.startTime}.`
    );

    // await this._notificationService.createNotification(
    //   adminId,
    //   "admin",
    //   "New Slot Booking Alert",
    //   `User ${userName} booked a slot with trainer ${trainerName}.`
    // );

    return res.status(HttpStatus.OK).json(booking);
  }
}
