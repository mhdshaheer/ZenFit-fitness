import { FilterQuery } from "mongoose";
import { ProgramDto } from "../../dtos/program.dtos";
import { IProgram } from "../../models/program.model";

export interface IProgramRepository {
  createProgram(
    condition: Partial<IProgram>,
    program: Partial<IProgram>
  ): Promise<IProgram | null>;

  getPrograms(id: string): Promise<IProgram[]>;
  getProgramsFilter(condition: FilterQuery<IProgram>): Promise<IProgram[]>;
}
