import { Types } from "mongoose";
import { BookingModel, IBooking } from "../../models/booking.model";
import { BaseRepository } from "../base.repository";
import { IBookingRepository } from "../interface/booking.repository.interface";
import { ISlot } from "../../models/slot.model";
import { injectable } from "inversify";

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }
  async createBooking(
    userId: string,
    day: string,
    date: Date,
    slot: ISlot
  ): Promise<IBooking> {
    const bookedCount = await this.model.countDocuments({
      slotId: slot._id,
      day,
      status: "booked",
    });
    if (bookedCount >= slot?.capacity) {
      throw new Error("Slot is already full for this day");
    }
    const existing = await this.model.findOne({
      slotId: slot._id,
      userId: new Types.ObjectId(userId),
      day,
      status: "booked",
    });

    if (existing) {
      throw new Error("User already booked this slot");
    }

    // Create new booking
    const booking = await this.model.create({
      slotId: slot._id,
      userId: new Types.ObjectId(userId),
      day,
      date,
      status: "booked",
    });
    return booking;
  }
}
