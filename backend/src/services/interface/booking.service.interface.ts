import { IBooking } from "../../models/booking.model";

export interface IBookingService {
  createBooking(
    slotId: string,
    userId: string,
    day: string,
    date: Date
  ): Promise<IBooking>;
  getMyBookings(userId: string, programId?: string): Promise<any[]>;
  getTrainerBookings(trainerId: string): Promise<any[]>;
}
