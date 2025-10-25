import { HydratedDocument } from "mongoose";
import { ISlotPopulated, ISlotStatus } from "../../interfaces/slot.interface";
import { ISlot } from "../../models/slot.model";

export interface ISlotRepository {
  createSlot(slotData: Partial<ISlot>): Promise<ISlotPopulated>;
  getSlotByTrainerId(trainerId: string): Promise<ISlotPopulated[]>;
  updateSlot(
    slotId: string,
    slotData: Partial<ISlot>
  ): Promise<HydratedDocument<ISlotPopulated>>;
  updateSlotStatus(
    slotId: string,
    slotStatus: ISlotStatus
  ): Promise<HydratedDocument<ISlotPopulated>>;
}
