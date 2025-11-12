import { IBooking } from "../../models/booking.model";
import { ISlot } from "../../models/slot.model";

export interface IBookingRepository {
  createBooking(
    userId: string,
    day: string,
    date: Date,
    slot: ISlot
  ): Promise<IBooking>;
  getMyBookings(userId: string, programId?: string): Promise<IBooking[]>;
  getTrainerBookings(trainerId: string): Promise<any[]>;
}
