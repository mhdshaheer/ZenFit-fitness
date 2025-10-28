import { Request, Response } from "express";
import { IBooking } from "../../models/booking.model";

export interface IBookingController {
  createBooking(req: Request, res: Response): Promise<Response<IBooking>>;
}
