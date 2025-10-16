import { Request, Response } from "express";
import { IProgramController } from "../interface/program.controller.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { IProgramService } from "../../services/interface/program.service.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { ProgramDto } from "../../dtos/program.dtos";
import { AppError } from "../../shared/utils/appError.util";
import { HttpResponse } from "../../const/response_message.const";

export class ProgramController implements IProgramController {
  constructor(
    @inject(TYPES.ProgramService) private _programService: IProgramService
  ) {}

  async saveProgramDraft(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const userId = (req as any)?.user?.id;

    if (!data)
      throw new AppError(
        HttpResponse.PROGRAM_DATA_REQUIRED,
        HttpStatus.BAD_REQUEST
      );

    data.trainerId = userId;
    const draft = await this._programService.saveProgramDraft(data);

    if (!draft)
      throw new AppError(
        HttpResponse.PROGRAM_SAVED_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    res.status(HttpStatus.OK).json({
      message: HttpResponse.PROGRAM_SAVED_SUCCESSFULLY,
    });
  }

  async saveProgram(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const userId = (req as any)?.user?.id;

    if (!data)
      throw new AppError(
        HttpResponse.PROGRAM_DATA_REQUIRED,
        HttpStatus.BAD_REQUEST
      );

    data.trainerId = userId;
    const program = await this._programService.saveProgramDraft(data);

    if (!program)
      throw new AppError(
        HttpResponse.PROGRAM_SAVED_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );

    res.status(HttpStatus.OK).json({
      message: HttpResponse.PROGRAM_SAVED_SUCCESSFULLY,
    });
  }

  async getPrograms(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const programs = await this._programService.getPrograms(userId);

    res.status(HttpStatus.OK).json({ programs });
  }

  async getProgramsCategories(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const programs = await this._programService.getProgramsCategories(userId);

    res.status(HttpStatus.OK).json({ programs });
  }
  async getAllPrograms(
    _req: Request,
    res: Response
  ): Promise<Response<ProgramDto[]>> {
    const programs = await this._programService.getAllPrograms();
    return res.status(HttpStatus.OK).json(programs);
  }

  async getProgramsByParantId(req: Request, res: Response): Promise<void> {
    const parantCategoryId = req.params.id;
    const programs = await this._programService.getProgramsByParentId(
      parantCategoryId
    );

    res.status(HttpStatus.OK).json({ programs });
  }

  async findProgram(
    req: Request,
    res: Response
  ): Promise<Response<ProgramDto>> {
    const { id } = req.params;
    const program = await this._programService.findProgram(id);

    if (!program)
      throw new AppError(HttpResponse.PROGRAM_NOT_FOUND, HttpStatus.NOT_FOUND);

    return res.status(HttpStatus.OK).json(program);
  }

  async updateProgram(
    req: Request,
    res: Response
  ): Promise<Response<{ message: string }>> {
    const programId = req.params.id;
    const trainerId = (req as any)?.user?.id;
    const programData = req.body;

    const response = await this._programService.updateProgram(programId, {
      ...programData,
      trainerId,
    });

    if (!response)
      throw new AppError(
        HttpResponse.PROGRAM_UPDATE_FAILED,
        HttpStatus.NOT_FOUND
      );

    return res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.PROGRAM_UPDATE_SUCCESS });
  }

  async updateApprovalStatus(
    req: Request,
    res: Response
  ): Promise<Response<ProgramDto>> {
    const { programId } = req.params;
    const approvalStatus = req.body.approvalStatus;
    const program = await this._programService.updateApprovalStatus(
      programId,
      approvalStatus
    );
    return res.status(HttpStatus.OK).json(program);
  }
}
