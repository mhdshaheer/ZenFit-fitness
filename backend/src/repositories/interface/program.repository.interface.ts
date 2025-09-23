import { FilterQuery } from "mongoose";
import { IProgram } from "../../models/program.model";

export interface IProgramRepository {
  createProgram(
    condition: Partial<IProgram>,
    program: Partial<IProgram>
  ): Promise<IProgram | null>;

  getPrograms(id: string): Promise<IProgram[]>;
  getProgramsFilter(condition: FilterQuery<IProgram>): Promise<IProgram[]>;
  findProgramById(programId: string): Promise<IProgram | null>;
}
