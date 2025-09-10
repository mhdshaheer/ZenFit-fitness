import { ProgramDto, ProgramSlotDto } from "../../dtos/program.dtos";
import { IProgram } from "../../models/program.model";

export interface IProgramService {
  saveProgramDraft(data: IProgram): Promise<IProgram | null>;
  getPrograms(id: string): Promise<ProgramDto[]>;
  getProgramsCategories(id: string): Promise<ProgramSlotDto[]>;
}
