import { IBooking } from "../../models/booking.model";

export interface IBookingService {
  createBooking(
    slotId: string,
    userId: string,
    day: string,
    date: Date
  ): Promise<IBooking>;

}
