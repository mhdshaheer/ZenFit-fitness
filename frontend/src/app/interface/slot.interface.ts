export interface ISlotOutput {
  id: string;
  program: IProgramCreateSlot;
  days: string[];
  capacity: number;
  startTime: string;
  endTime: string;
  status: ISlotStatus;
}
export interface ISlotInput {
  programId: string;
  days: string[];
  capacity: number;
  startTime: string;
  endTime: string;
}
export interface IProgramCreateSlot {
  id: string;
  title: string;
  duration: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}
export type ISlotStatus = 'active' | 'inactive';

export interface TimeOption {
  display: string;
  value: string;
  minutes: number;
}
export interface IDay {
  name: string;
  value: string;
  selected: boolean;
}

export interface ISlotUserOutput {
  _id: string;
  day: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  booked?: number;
  bookedUsers?: string[];
}
