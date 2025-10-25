import { IProgramCreateSlot } from "../interfaces/slot.interface";

export interface SlotDisplyDto {
  id: string;
  program: IProgramCreateSlot;
  days: string[];
  startTime: string;
  endTime: string;
  status: "active" | "inactive";
}
