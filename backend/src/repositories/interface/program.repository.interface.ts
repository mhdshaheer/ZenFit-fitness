import { FilterQuery } from "mongoose";
import { IProgram } from "../../models/program.model";
import { IApprovalStatus } from "../../interfaces/program.interface";

export interface IProgramRepository {
  createProgram(
    condition: Partial<IProgram>,
    program: Partial<IProgram>
  ): Promise<IProgram | null>;
  getAllPrograms(): Promise<IProgram[]>;
  getPrograms(trainerId: string): Promise<IProgram[]>;
  getProgramsFilter(condition: FilterQuery<IProgram>): Promise<IProgram[]>;
  findProgramById(programId: string): Promise<IProgram | null>;
  updateProgramById(
    programId: string,
    program: Partial<IProgram>
  ): Promise<IProgram | null>;
  updateApprovalStatus(
    programId: string,
    approvalStatus: IApprovalStatus
  ): Promise<IProgram | null>;
}
