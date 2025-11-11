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

  async getMyBookings(userId: string, programId?: string): Promise<IBooking[]> {
    const query: any = {
      userId: new Types.ObjectId(userId),
    };

    // Build aggregation pipeline
    const pipeline: any[] = [
      { $match: query },
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slotDetails",
        },
      },
      { $unwind: "$slotDetails" },
    ];

    // Filter by programId if provided
    if (programId) {
      pipeline.push({
        $match: {
          "slotDetails.programId": new Types.ObjectId(programId),
        },
      });
    }

    // Sort by date descending (newest first)
    pipeline.push({ $sort: { date: -1 } });

    const bookings = await this.model.aggregate(pipeline);
    return bookings;
  }
}
