import { Request, Response } from "express";
import { IProgramController } from "../interface/program.controller.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { IProgramService } from "../../services/interface/program.service.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ProgramDto } from "../../dtos/program.dtos";
import { HttpResponse } from "../../const/response_message.const";
import { AppError } from "../../shared/utils/appError.util";

export class ProgramController implements IProgramController {
  constructor(
    @inject(TYPES.ProgramService) private programService: IProgramService
  ) {}

  async saveProgramDraft(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const userId = (req as any)?.user?.id;

    if (!data) throw new AppError("Program data is required", HttpStatus.BAD_REQUEST);

    data.trainerId = userId;
    const draft = await this.programService.saveProgramDraft(data);

    if (!draft) throw new AppError("Failed to save draft", HttpStatus.INTERNAL_SERVER_ERROR);

    res.status(HttpStatus.OK).json({
      message: "Program draft is saved successfully",
    });
  }

  async saveProgram(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const userId = (req as any)?.user?.id;

    if (!data) throw new AppError("Program data is required", HttpStatus.BAD_REQUEST);

    data.trainerId = userId;
    const program = await this.programService.saveProgramDraft(data);

    if (!program)
      throw new AppError("Failed to save Training Program", HttpStatus.INTERNAL_SERVER_ERROR);

    res.status(HttpStatus.OK).json({
      message: "Training Program is saved successfully",
    });
  }

  async getPrograms(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const programs = await this.programService.getPrograms(userId);

    res.status(HttpStatus.OK).json({ programs });
  }

  async getProgramsCategories(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const programs = await this.programService.getProgramsCategories(userId);

    res.status(HttpStatus.OK).json({ programs });
  }

  async getProgramsByParantId(req: Request, res: Response): Promise<void> {
     const id = req.params.id;
    const programs = await this.programService.getProgramsByParentId(id);

    res.status(HttpStatus.OK).json({ programs });
  }

  async findProgram(
    req: Request,
    res: Response
  ): Promise<Response<ProgramDto>> {
    const { id } = req.params;
    const program = await this.programService.findProgram(id);

    if (!program) throw new AppError("Program not found", HttpStatus.NOT_FOUND);

    return res.status(HttpStatus.OK).json(program);
  }

  async updateProgram(
    req: Request,
    res: Response
  ): Promise<Response<{ message: string }>> {
    const programId = req.params.id;
    const trainerId = (req as any)?.user?.id;
    const programData = req.body;

    const response = await this.programService.updateProgram(programId, {
      ...programData,
      trainerId,
    });

    if (!response) throw new AppError("Program updation failed", HttpStatus.NOT_FOUND);

    return res.status(HttpStatus.OK).json({ message: "Program updated successfully" });
  
  }
}
