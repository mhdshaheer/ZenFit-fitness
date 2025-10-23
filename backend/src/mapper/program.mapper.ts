import {
  ProgramDto,
  ProgramSlotCreateDto,
  ProgramSlotDto,
} from "../dtos/program.dtos";
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
    createdAt: programs.createdAt?.toString(),
    approvalStatus: programs.approvalStatus,
    trainerId: programs.trainerId.toString(),
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

export const mapToProgramSlotCreateDto = (
  programs: IProgram
): ProgramSlotCreateDto => {
  return {
    id: programs._id,
    title: programs.title,
    duration: programs.duration,
    difficultyLevel: programs.difficultyLevel,
  };
};
