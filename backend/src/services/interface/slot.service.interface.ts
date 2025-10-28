import { SlotDisplyDto } from "../../dtos/slot.dtos";
import { ISlotListForUser, ISlotStatus } from "../../interfaces/slot.interface";
import { ISlot } from "../../models/slot.model";

export interface ISlotService {
  createSlot(slotData: Partial<ISlot>): Promise<SlotDisplyDto>;
  getSlotsByTrainerId(trainerId: string): Promise<SlotDisplyDto[]>;
  updateSlot(slotId: string, slotData: Partial<ISlot>): Promise<SlotDisplyDto>;
  updateSlotStatus(
    slotId: string,
    slotStatus: ISlotStatus
  ): Promise<SlotDisplyDto>;
  getSlotOnUser(programId: string): Promise<ISlotListForUser[]>;
}
