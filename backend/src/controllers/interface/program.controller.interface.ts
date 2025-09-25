import { Request, Response } from "express";
import { ProgramDto } from "../../dtos/program.dtos";
import { AuthRequest } from "../../shared/types/authRequest.interface";

export interface IProgramController {
  saveProgramDraft(req: AuthRequest, res: Response): Promise<void>;
  saveProgram(req: AuthRequest, res: Response): Promise<void>;
  getPrograms(req: AuthRequest, res: Response): Promise<void>;
  getProgramsCategories(req: AuthRequest, res: Response): Promise<void>;
  getProgramsByParantId(req: Request, res: Response): Promise<void>;
  findProgram(req: Request, res: Response): Promise<Response<ProgramDto>>;
  updateProgram(
    req: AuthRequest,
    res: Response
  ): Promise<Response<{ message: string }>>;
}
