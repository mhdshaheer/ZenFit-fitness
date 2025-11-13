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
      {
        $lookup: {
          from: "feedbacks",
          let: { slotId: "$slotId", sessionDate: "$date" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$slotId", "$$slotId"] },
                    {
                      $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$sessionDate" } },
                        { $dateToString: { format: "%Y-%m-%d", date: "$$sessionDate" } }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: "feedbackDetails",
        },
      },
      {
        $addFields: {
          feedback: {
            $cond: {
              if: { $gt: [{ $size: "$feedbackDetails" }, 0] },
              then: { $arrayElemAt: ["$feedbackDetails.feedback", 0] },
              else: null
            }
          }
        }
      }
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

  async getTrainerBookings(trainerId: string): Promise<any[]> {
    console.log('🔍 Fetching bookings for trainerId:', trainerId);

    const pipeline: any[] = [
      {
        $lookup: {
          from: "slots",
          localField: "slotId",
          foreignField: "_id",
          as: "slotDetails",
        },
      },
      { $unwind: "$slotDetails" },
      {
        $match: {
          "slotDetails.trainerId": new Types.ObjectId(trainerId),
        },
      },
      {
        $lookup: {
          from: "programs",
          localField: "slotDetails.programId",
          foreignField: "_id",
          as: "programDetails",
        },
      },
      { $unwind: "$programDetails" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $group: {
          _id: {
            slotId: "$slotId",
            day: "$day",
            date: "$date",
          },
          slotId: { $first: "$slotId" },
          day: { $first: "$day" },
          date: { $first: "$date" },
          startTime: { $first: "$slotDetails.startTime" },
          endTime: { $first: "$slotDetails.endTime" },
          capacity: { $first: "$slotDetails.capacity" },
          programName: { $first: "$programDetails.title" },
          duration: { $first: "$programDetails.duration" },
          difficultyLevel: { $first: "$programDetails.difficultyLevel" },
          bookedCount: { $sum: 1 },
          students: {
            $push: {
              name: "$userDetails.fullName",
              email: "$userDetails.email",
              bookingId: "$_id",
              status: "$status",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          slotId: 1,
          day: 1,
          date: 1,
          startTime: 1,
          endTime: 1,
          capacity: 1,
          programName: 1,
          duration: 1,
          difficultyLevel: 1,
          bookedCount: 1,
          students: 1,
        },
      },
      { $sort: { date: -1 } },
    ];

    const sessions = await this.model.aggregate(pipeline);
    console.log('📊 Found grouped sessions:', sessions.length);
    console.log('📊 Sample session:', sessions[0]);
    return sessions;
  }

  async getBookingsBySlotId(slotId: string): Promise<IBooking[]> {
    const bookings = await this.model.find({
      slotId: new Types.ObjectId(slotId),
      status: "booked"
    }).populate('userId', 'fullName email');
    return bookings;
  }

  async cancelBookingsBySlotId(slotId: string): Promise<IBooking[]> {
    const bookings = await this.model.find({
      slotId: new Types.ObjectId(slotId),
      status: "booked"
    }).populate('userId', 'fullName email');

    // Update all booked slots to cancelled
    await this.model.updateMany(
      {
        slotId: new Types.ObjectId(slotId),
        status: "booked"
      },
      {
        $set: { status: "cancelled" }
      }
    );

    return bookings;
  }
}
