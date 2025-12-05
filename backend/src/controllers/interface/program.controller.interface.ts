import { Request, Response } from "express";
import { ProgramDto, ProgramSlotCreateDto } from "../../dtos/program.dtos";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface IProgramController {
  saveProgramDraft(req: AuthenticatedRequest, res: Response): Promise<void>;
  saveProgram(req: AuthenticatedRequest, res: Response): Promise<void>;
  getPrograms(req: AuthenticatedRequest, res: Response): Promise<void>;
  getProgramsCategories(req: AuthenticatedRequest, res: Response): Promise<void>;
  getProgramsByParantId(req: AuthenticatedRequest, res: Response): Promise<void>;
  getAllPrograms(req: Request, res: Response): Promise<Response<ProgramDto[]>>;
  getProgramsForSlotCreate(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<ProgramSlotCreateDto[]>>;
  findProgram(req: Request, res: Response): Promise<Response<ProgramDto>>;
  updateProgram(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<{ message: string }>>;

  updateApprovalStatus(
    req: Request,
    res: Response
  ): Promise<Response<ProgramDto>>;
}
