import { ISlot, SlotModel } from "../../models/slot.model";
import { ISlotRepository } from "../interface/slot.repository.interface";
import { BaseRepository } from "../base.repository";
import {
  ISlotListForUser,
  ISlotPopulated,
  ISlotStatus,
} from "../../interfaces/slot.interface";
import { HydratedDocument, PipelineStage, Types } from "mongoose";
import { IProgram } from "../../models/program.model";

export class SlotRepository
  extends BaseRepository<ISlot>
  implements ISlotRepository
{
  constructor() {
    super(SlotModel);
  }
  async createSlot(slotData: Partial<ISlot>): Promise<ISlotPopulated> {
    return this.createAndPopulate(slotData, "programId");
  }
  async getSlotByTrainerId(
    trainerId: string
  ): Promise<HydratedDocument<ISlotPopulated>[]> {
    return this.model
      .find({ trainerId })
      .populate<{ programId: IProgram }>("programId");
  }
  async updateSlot(
    slotId: string,
    slotData: Partial<ISlot>
  ): Promise<HydratedDocument<ISlotPopulated>> {
    const populatedData = await this.model
      .findByIdAndUpdate(slotId, slotData, { new: true })
      .populate<{ programId: IProgram }>("programId");
    if (!populatedData) throw new Error("Slot not found");

    return populatedData;
  }
  async updateSlotStatus(
    slotId: string,
    slotStatus: ISlotStatus
  ): Promise<HydratedDocument<ISlotPopulated>> {
    const populatedData = await this.model
      .findByIdAndUpdate(slotId, { status: slotStatus }, { new: true })
      .populate<{ programId: IProgram }>("programId");
    if (!populatedData) throw new Error("Slot not found");
    return populatedData;
  }
  async getProgramSlotListOnUser(
    programId: string
  ): Promise<ISlotListForUser[]> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          status: "active",
          ...(programId ? { programId: new Types.ObjectId(programId) } : {}),
        },
      },
      { $unwind: "$days" },
      {
        $lookup: {
          from: "bookings",
          let: { slotId: "$_id", day: "$days" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$slotId", "$$slotId"] },
                    { $eq: ["$day", "$$day"] },
                    { $eq: ["$status", "booked"] },
                  ],
                },
              },
            },
          ],
          as: "bookings",
        },
      },
      {
        $addFields: {
          booked: { $size: "$bookings" },
          isAvailable: { $lt: [{ $size: "$bookings" }, "$capacity"] },
          bookedUsers: {
            $map: {
              input: "$bookings",
              as: "booking",
              in: "$$booking.userId",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          programId: 1,
          trainerId: 1,
          day: "$days",
          startTime: 1,
          endTime: 1,
          capacity: 1,
          booked: 1,
          isAvailable: 1,
          bookedUsers: 1,
        },
      },
    ];
    return await this.model.aggregate(pipeline);
  }
  async findSlotById(slotId: string): Promise<ISlot | null> {
    return await this.model.findById(slotId);
  }
}
