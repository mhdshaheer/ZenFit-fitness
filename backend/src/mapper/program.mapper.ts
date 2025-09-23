import { ProgramDto, ProgramSlotDto } from "../dtos/program.dtos";
import { IProgram } from "../models/program.model";

export const mapToProgramDto = (programs: IProgram): ProgramDto => {
  return {
    id: programs.id,
    title: programs.title,
    duration: programs.duration,
    category: JSON.stringify(programs.category),
    description: programs.description,
    difficultyLevel: programs.difficultyLevel,
    price: programs.price,
    status: programs.status,
    programId: programs.programId,
    //   image?: programs;
    //   enrolledCount?: programs.entrolledCount,
    //   rating?: number;
  };
};

export const mapToProgramSlotDto = (programs: IProgram): ProgramSlotDto => {
  return {
    id: programs._id,
    title: programs.title,
    category: JSON.stringify(programs.category),
    duration: programs.duration,
    // entrolledCount:programs.entrolledCount
  };
};
