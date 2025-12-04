import { IBooking, IBookingSnapshot } from "../../models/booking.model";

export interface CreateBookingParams {
  slotId: string;
  templateId: string;
  userId: string;
  day: string;
  date: Date;
  snapshot: IBookingSnapshot;
}

export interface IBookingRepository {
  createBooking(params: CreateBookingParams): Promise<IBooking>;
  getMyBookings(userId: string, programId?: string): Promise<IBooking[]>;
  getTrainerBookings(trainerId: string): Promise<any[]>;
  getTrainerBookingRecords(trainerId: string): Promise<IBooking[]>;
  getBookingsBySlotId(slotId: string): Promise<IBooking[]>;
  getBookingsForSlotOnDate(slotId: string, date: Date): Promise<IBooking[]>;
  cancelBookingsBySlotId(slotId: string): Promise<IBooking[]>;
  findById(bookingId: string): Promise<IBooking | null>;
  cancelBookingById(bookingId: string): Promise<IBooking | null>;
  findActiveBookingByUserAndSlot(
    userId: string,
    slotId: string
  ): Promise<IBooking | null>;
  findActiveBookingsForUserOnDate(
    userId: string,
    slotDate: Date
  ): Promise<IBooking[]>;
}
