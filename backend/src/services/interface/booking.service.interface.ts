import { IBooking } from "../../models/booking.model";

export interface IBookingService {
  createBooking(slotInstanceId: string, userId: string): Promise<IBooking>;
  getMyBookings(userId: string, programId?: string): Promise<any[]>;
  getTrainerBookings(trainerId: string): Promise<any[]>;
}
