import { IProgramCreateSlot } from "../interfaces/slot.interface";

export interface SlotDisplyDto {
  id: string;
  program: IProgramCreateSlot;
  days: string[];
  startTime: string;
  capacity: number;
  endTime: string;
  status: "active" | "inactive";
}
export interface SlotDisplyOnUserDto {
  id: string;
  program: IProgramCreateSlot;
  days: string[];
  startTime: string;
  capacity: number;
  endTime: string;
  status: "active" | "inactive";
  trainerId: string;
  programId: string;
  booked: 2;
}
