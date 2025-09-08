import { IProgram } from "../../models/program.model";

export interface IProgramService {
  saveProgramDraft(data: IProgram): Promise<IProgram | null>;
}
