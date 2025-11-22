import {
  ProgramDto,
  ProgramSlotCreateDto,
  ProgramSlotDto,
} from "../../dtos/program.dtos";
import { IApprovalStatus } from "../../interfaces/program.interface";
import { IProgram } from "../../models/program.model";

export interface IProgramService {
  saveProgramDraft(data: IProgram): Promise<IProgram | null>;
  saveProgram(data: IProgram): Promise<IProgram | null>;
  getAllPrograms(): Promise<ProgramDto[]>;
  getPrograms(trainerId: string): Promise<ProgramDto[]>;
  getProgramsForSlotCreate(trainerId: string): Promise<ProgramSlotCreateDto[]>;
  getProgramsCategories(trainerId: string): Promise<ProgramSlotDto[]>;
  getProgramsByParentId(
    catgoryParantId: string,
    userId: string
  ): Promise<ProgramDto[]>;
  findProgram(programId: string): Promise<ProgramDto>;
  updateProgram(
    programId: string,
    program: Partial<IProgram>
  ): Promise<ProgramDto>;
  updateApprovalStatus(
    programId: string,
    approvalStatus: IApprovalStatus
  ): Promise<ProgramDto>;
}
