import { IProgram } from "../../models/program.model";
import { ProgramRepositoy } from "../../repositories/implimentation/program.repository";
import { IProgramService } from "../interface/program.service.interface";

export class ProgramService implements IProgramService {
  programRepository = new ProgramRepositoy();
  async saveProgramDraft(data: IProgram): Promise<IProgram | null> {
    let condition = {
      trainerId: data.trainerId,
      programId: data.programId,
    };
    const savedData = await this.programRepository.createProgram(
      condition,
      data
    );
    return savedData;
  }
}
