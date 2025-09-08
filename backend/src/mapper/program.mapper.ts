import { ProgramDto } from "../dtos/program.dtos";
import { IProgram } from "../models/program.model";

export const mapToProgramDto = (programs: IProgram): ProgramDto => {
  return {
    id: programs.id,
    title: programs.title,
    duration: programs.duration,
    category: programs.category,
    description: programs.description,
    difficultyLevel: programs.difficultyLevel,
    price: programs.price,
    status: programs.status,
    //   image?: programs;
    //   enrolledCount?: programs.entrolledCount,
    //   rating?: number;
  };
};
