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
import { ICategoryRepository } from "../../repositories/interface/category.repository.interface";
import logger from "../../shared/services/logger.service";

export class ProgramService implements IProgramService {
  constructor(
    @inject(TYPES.ProgramRespository)
    private programRepository: IProgramRepository,
    @inject(TYPES.CategoryRepository)
    private categoryRepository: ICategoryRepository
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
  async getProgramsByParentId(id: string): Promise<ProgramDto[]> {
    const subCategories = await this.categoryRepository.findAllCategory({
      parantId: id,
    });
    if (subCategories == null) {
      throw new Error("No sub categories found.");
    }
    const subCategoryIds = subCategories.map((cat) => cat._id);
    const programs = await this.programRepository.getProgramsFilter({
      category: { $in: subCategoryIds },
    });
    const mappedResult = programs.map(mapToProgramDto);

    return mappedResult;
  }

  async findProgram(id: string): Promise<ProgramDto> {
    try {
      const program = await this.programRepository.findProgramById(id);
      if (!program) {
        throw new Error("No category is found");
      }
      const programDto = mapToProgramDto(program);
      return programDto;
    } catch (error) {
      logger.error("Error fetching category :", error);
      throw new Error("Failed to fetch category");
    }
  }

  async updateProgram(
    id: string,
    program: Partial<IProgram>
  ): Promise<ProgramDto> {
    console.log("service :", id, program);
    try {
      const updated = await this.programRepository.updateProgramById(
        id,
        program
      );
      console.log("Updated data :", updated);
      if (!updated) {
        throw new Error("Program updation is failed");
      }
      const mappedResult = mapToProgramDto(updated);
      return mappedResult;
    } catch (error) {
      logger.error("Error in program updation", error);
      throw new Error("Failed to update program");
    }
  }
}
