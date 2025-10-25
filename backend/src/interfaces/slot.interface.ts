import { IProgram } from "../models/program.model";
import { ISlot } from "../models/slot.model";

export interface ISlotOutput {
  id: string;
  program: IProgramCreateSlot;
  days: string[];
  startTime: string;
  endTime: string;
  status: ISlotStatus;
}
export interface IProgramCreateSlot {
  id: string;
  title: string;
  duration: string;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
}
export interface ISlotInput {
  programId: string;
  days: string[];
  startTime: string;
  endTime: string;
}

export interface ISlotPopulated extends Omit<ISlot, "programId"> {
  programId: IProgram;
}
export type ISlotStatus = "active" | "inactive";
