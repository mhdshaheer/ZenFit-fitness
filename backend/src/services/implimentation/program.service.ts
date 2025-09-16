import { inject } from "inversify";
import { ProgramDto, ProgramSlotDto } from "../../dtos/program.dtos";
import {
  mapToProgramDto,
  mapToProgramSlotDto,
} from "../../mapper/program.mapper";
import { IProgram } from "../../models/program.model";
import { IProgramRepository } from "../../repositories/interface/program.repository.interface";
import { IProgramService } from "../interface/program.service.interface";
import { TYPES } from "../../shared/types/inversify.types";

export class ProgramService implements IProgramService {
  constructor(
    @inject(TYPES.ProgramRespository)
    private programRepository: IProgramRepository
  ) {}
  async saveProgramDraft(data: IProgram): Promise<IProgram | null> {
    const condition = {
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

  async getProgramsCategories(id: string): Promise<ProgramSlotDto[]> {
    const result = await this.programRepository.getPrograms(id);
    const mappedResult = result.map(mapToProgramSlotDto);
    return mappedResult;
  }
}
