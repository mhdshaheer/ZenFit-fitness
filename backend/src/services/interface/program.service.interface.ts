import { ProgramDto, ProgramSlotDto } from "../../dtos/program.dtos";
import { IApprovalStatus } from "../../interfaces/program.interface";
import { IProgram } from "../../models/program.model";

export interface IProgramService {
  saveProgramDraft(data: IProgram): Promise<IProgram | null>;
  getAllPrograms(): Promise<ProgramDto[]>;
  getPrograms(id: string): Promise<ProgramDto[]>;
  getProgramsCategories(id: string): Promise<ProgramSlotDto[]>;
  getProgramsByParentId(id: string): Promise<ProgramDto[]>;
  findProgram(id: string): Promise<ProgramDto>;
  updateProgram(id: string, program: Partial<IProgram>): Promise<ProgramDto>;
  updateApprovalStatus(
    programId: string,
    approvalStatus: IApprovalStatus
  ): Promise<ProgramDto>;
}
