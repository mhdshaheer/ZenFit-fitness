import { IBooking } from "../../models/booking.model";

export interface IBookingService {
  createBooking(slotInstanceId: string, userId: string): Promise<IBooking>;
  getMyBookings(userId: string, programId?: string): Promise<Record<string, unknown>[]>;
  getTrainerBookings(trainerId: string): Promise<Record<string, unknown>[]>;
}
