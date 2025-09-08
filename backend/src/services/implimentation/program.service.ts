import { ProgramDto } from "../../dtos/program.dtos";
import { mapToProgramDto } from "../../mapper/program.mapper";
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
  async getPrograms(id: string): Promise<ProgramDto[]> {
    const result = await this.programRepository.getPrograms(id);
    const mappedResult = result.map(mapToProgramDto);
    return mappedResult;
  }
}
