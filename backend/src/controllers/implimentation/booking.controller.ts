import { Request, Response } from "express";
import { IBooking } from "../../models/booking.model";
import { IBookingController } from "../interface/booking.controller.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IBookingService } from "../../services/interface/booking.service.interface";
import { HttpResponse } from "../../const/response_message.const";

export class BookingController implements IBookingController {
  @inject(TYPES.BookingService)
  private readonly _bookingService!: IBookingService;
  async createBooking(
    req: Request,
    res: Response
  ): Promise<Response<IBooking>> {
    const { slotId, day, date } = req.body;
    const userId = (req as any).user?.id;

    if (!slotId || !userId || !day || !date) {
      throw new AppError("Missing required fields", HttpStatus.BAD_REQUEST);
    }

    const result = await this._bookingService.createBooking(
      slotId,
      userId,
      day,
      new Date(date)
    );

    return res.status(HttpStatus.OK).json(result);
  }
}
