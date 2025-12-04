import { Types } from "mongoose";
import { BookingModel, IBooking } from "../../models/booking.model";
import { BaseRepository } from "../base.repository";
import {
  CreateBookingParams,
  IBookingRepository,
} from "../interface/booking.repository.interface";
import { injectable } from "inversify";

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository {
  constructor() {
    super(BookingModel);
  }

  async createBooking(params: CreateBookingParams): Promise<IBooking> {
    const { slotId, templateId, userId, day, date, snapshot } = params;

    const booking = await this.model.create({
      slotId: new Types.ObjectId(slotId),
      templateId: new Types.ObjectId(templateId),
      userId: new Types.ObjectId(userId),
      day,
      date,
      status: "booked",
      snapshot: {
        ...snapshot,
        slotDate: snapshot.slotDate,
        programId: snapshot.programId,
        trainerId: snapshot.trainerId,
        templateId: snapshot.templateId,
      },
    });

    return booking;
  }

  async getMyBookings(userId: string, programId?: string): Promise<IBooking[]> {
    const matchStage: any = {
      userId: new Types.ObjectId(userId),
    };

    if (programId) {
      matchStage["snapshot.programId"] = new Types.ObjectId(programId);
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "feedbacks",
          let: {
            slotId: { $toString: "$slotId" },
            sessionDate: "$snapshot.slotDate",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$slotId", "$$slotId"] },
                    {
                      $eq: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$sessionDate" } },
                        { $dateToString: { format: "%Y-%m-%d", date: "$$sessionDate" } },
                      ],
                    },
                  ],
                },
              },
            },
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
              else: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          slotId: 1,
          userId: 1,
          templateId: 1,
          day: 1,
          date: "$snapshot.slotDate",
          status: 1,
          createdAt: 1,
          snapshot: 1,
          feedback: 1,
        },
      },
      { $sort: { "snapshot.slotDate": -1, "snapshot.startMinutes": 1 } },
    ];

    return this.model.aggregate(pipeline);
  }

  async getTrainerBookingRecords(trainerId: string): Promise<IBooking[]> {
    return this.model
      .find({ "snapshot.trainerId": new Types.ObjectId(trainerId) })
      .populate('userId', 'fullName email')
      .lean();
  }

  async getAllBookings(): Promise<IBooking[]> {
    return this.model.find().populate('userId', 'fullName email').lean();
  }

  async getTrainerBookings(trainerId: string): Promise<any[]> {
    const pipeline: any[] = [
      {
        $match: {
          "snapshot.trainerId": new Types.ObjectId(trainerId),
        },
      },
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
        $lookup: {
          from: "slotinstances",
          localField: "slotId",
          foreignField: "_id",
          as: "slotInstance",
        },
      },
      {
        $unwind: {
          path: "$slotInstance",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            slotId: "$slotId",
            slotDate: "$snapshot.slotDate",
          },
          slotId: { $first: "$slotId" },
          day: { $first: "$day" },
          date: { $first: "$snapshot.slotDate" },
          startTime: { $first: "$snapshot.startTime" },
          endTime: { $first: "$snapshot.endTime" },
          capacity: { $first: "$snapshot.capacity" },
          programName: { $first: "$snapshot.programTitle" },
          duration: { $first: "$snapshot.programDuration" },
          difficultyLevel: { $first: "$snapshot.programDifficulty" },
          bookedCount: { $sum: 1 },
          slotStatus: { $first: "$slotInstance.status" },
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
          status: "$slotStatus",
          students: 1,
        },
      },
      { $sort: { date: -1, startTime: 1 } },
    ];

    return this.model.aggregate(pipeline);
  }

  async getBookingsBySlotId(slotId: string): Promise<IBooking[]> {
    const bookings = await this.model.find({
      slotId: new Types.ObjectId(slotId),
      status: "booked"
    }).populate('userId', 'fullName email');
    return bookings;
  }

  async getBookingsForSlotOnDate(slotId: string, date: Date): Promise<IBooking[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const bookings = await this.model.find({
      slotId: new Types.ObjectId(slotId),
      status: "booked",
      "snapshot.slotDate": { $gte: start, $lte: end },
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

  async findActiveBookingByUserAndSlot(
    userId: string,
    slotId: string
  ): Promise<IBooking | null> {
    return this.model.findOne({
      userId: new Types.ObjectId(userId),
      slotId: new Types.ObjectId(slotId),
      status: "booked"
    });
  }

  async findActiveBookingsForUserOnDate(
    userId: string,
    slotDate: Date
  ): Promise<IBooking[]> {
    const start = new Date(slotDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(slotDate);
    end.setHours(23, 59, 59, 999);

    return this.model.find({
      userId: new Types.ObjectId(userId),
      status: "booked",
      "snapshot.slotDate": { $gte: start, $lte: end },
    });
  }

  async findById(bookingId: string): Promise<IBooking | null> {
    return this.model.findById(new Types.ObjectId(bookingId));
  }

  async cancelBookingById(bookingId: string): Promise<IBooking | null> {
    return this.model.findOneAndUpdate(
      { _id: new Types.ObjectId(bookingId) },
      { $set: { status: "cancelled" } },
      { new: true }
    );
  }
}
