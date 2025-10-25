import { ISlot, SlotModel } from "../../models/slot.model";
import { ISlotRepository } from "../interface/slot.repository.interface";
import { BaseRepository } from "../base.repository";
import { ISlotPopulated, ISlotStatus } from "../../interfaces/slot.interface";
import { HydratedDocument } from "mongoose";
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
}
