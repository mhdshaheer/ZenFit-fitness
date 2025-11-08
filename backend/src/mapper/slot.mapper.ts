import { SlotDisplyDto } from "../dtos/slot.dtos";
import { ISlotPopulated } from "../interfaces/slot.interface";

export const mapToSlotDisplayDto = (slot: ISlotPopulated): SlotDisplyDto => {
  return {
    id: slot._id as string,
    days: slot.days,
    program: {
      id: slot.programId._id,
      title: slot.programId.title,
      difficultyLevel: slot.programId.difficultyLevel,
      duration: slot.programId.duration,
    },
    capacity: slot.capacity,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.status,
  };
};
