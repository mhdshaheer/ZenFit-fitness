import { inject, injectable } from "inversify";
import {
  ProgramDto,
  ProgramSlotCreateDto,
  ProgramSlotDto,
} from "../../dtos/program.dtos";
import {
  mapToProgramDto,
  mapToProgramSlotCreateDto,
  mapToProgramSlotDto,
} from "../../mapper/program.mapper";
import { IProgram } from "../../models/program.model";
import { IProgramRepository } from "../../repositories/interface/program.repository.interface";
import { IProgramService } from "../interface/program.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { ICategoryRepository } from "../../repositories/interface/category.repository.interface";
import logger from "../../shared/services/logger.service";
import { IApprovalStatus } from "../../interfaces/program.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { IPaymentRepository } from "../../repositories/interface/payment.repostitory.interface";

@injectable()
export class ProgramService implements IProgramService {
  @inject(TYPES.ProgramRespository)
  private readonly _programRepository!: IProgramRepository;
  @inject(TYPES.CategoryRepository)
  private readonly _categoryRepository!: ICategoryRepository;
  @inject(TYPES.PaymentRepository)
  private readonly _paymentRepository!: IPaymentRepository;

  async saveProgramDraft(data: IProgram): Promise<IProgram | null> {
    const condition = {
      trainerId: data.trainerId,
      programId: data.programId,
    };
    const savedData = await this._programRepository.createProgram(
      condition,
      data
    );
    return savedData;
  }
  async saveProgram(data: IProgram): Promise<IProgram | null> {
    const condition = {
      trainerId: data.trainerId,
      programId: data.programId,
    };
    const savedData = await this._programRepository.createProgram(condition, {
      ...data,
      status: "active",
    });
    return savedData;
  }

  async getAllPrograms(): Promise<ProgramDto[]> {
    const programs = await this._programRepository.getAllPrograms();
    const mappedPrograms = programs.map(mapToProgramDto);
    return mappedPrograms;
  }

  async getProgramsByParentId(
    catgoryParantId: string,
    userId: string
  ): Promise<ProgramDto[]> {
    const subCategories = await this._categoryRepository.findAllCategory({
      parantId: catgoryParantId,
    });
    if (subCategories === null) {
      throw new Error("No sub categories found.");
    }
    const subCategoryIds = subCategories.map((cat) => cat._id);

    const purchasedPrograms =
      await this._paymentRepository.getPurchasedProgramIds(userId);
    const purchasedProgramIds = purchasedPrograms.map((p) => p.programId);

    const programs = await this._programRepository.getProgramsFilter({
      category: { $in: subCategoryIds },
      _id: { $nin: purchasedProgramIds },
      approvalStatus: "Approved",
    });
    const mappedResult = programs.map(mapToProgramDto);

    return mappedResult;
  }

  async findProgram(id: string): Promise<ProgramDto> {
    try {
      const program = await this._programRepository.findProgramById(id);
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
    try {
      const updated = await this._programRepository.updateProgramById(
        id,
        program
      );
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

  async updateApprovalStatus(
    programId: string,
    approvalStatus: IApprovalStatus
  ): Promise<ProgramDto> {
    const program = await this._programRepository.updateApprovalStatus(
      programId,
      approvalStatus
    );
    if (!program) {
      throw new AppError("Program is not updated", HttpStatus.NOT_FOUND);
    }
    const mappedProgram = mapToProgramDto(program);
    return mappedProgram;
  }

  // OCP
  async getPrograms(trainerId: string): Promise<ProgramDto[]> {
    return this._mapPrograms(trainerId, mapToProgramDto);
  }
  async getProgramsCategories(trainerId: string): Promise<ProgramSlotDto[]> {
    return this._mapPrograms(trainerId, mapToProgramSlotDto);
  }
  async getProgramsForSlotCreate(
    trainerId: string
  ): Promise<ProgramSlotCreateDto[]> {
    return this._mapPrograms(trainerId, mapToProgramSlotCreateDto);
  }

  private async _mapPrograms<T>(
    trainerId: string,
    mapper: (program: IProgram) => T
  ): Promise<T[]> {
    const result = await this._programRepository.getPrograms(trainerId);
    return result.map(mapper);
  }
}
