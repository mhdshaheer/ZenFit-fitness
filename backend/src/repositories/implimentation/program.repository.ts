import { FilterQuery } from "mongoose";
import { IProgram, ProgramModel } from "../../models/program.model";
import { BaseRepository } from "../base.repository";
import { IProgramRepository } from "../interface/program.repository.interface";

export class ProgramRepositoy
  extends BaseRepository<IProgram>
  implements IProgramRepository
{
  constructor() {
    super(ProgramModel);
  }
  async createProgram(
    condition: Partial<IProgram>,
    program: Partial<IProgram>
  ): Promise<IProgram | null> {
    return await this.updateCondition(condition, program);
  }
  async getAllPrograms(): Promise<IProgram[]> {
    return await this.find();
  }
  async getPrograms(id: string): Promise<IProgram[]> {
    return this.model.find({ trainerId: id }).populate("category");
  }
  async getProgramsFilter(
    condition: FilterQuery<IProgram>
  ): Promise<IProgram[]> {
    return this.model.find(condition).populate("category");
  }
  async findProgramById(programId: string): Promise<IProgram | null> {
    return this.model.findById(programId).populate("category").exec();
  }

  async updateProgramById(
    programId: string,
    program: Partial<IProgram>
  ): Promise<IProgram | null> {
    return this.update(programId, program);
  }
}
