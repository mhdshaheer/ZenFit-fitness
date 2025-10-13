import { Request, Response } from "express";
import { ProgramDto } from "../../dtos/program.dtos";

export interface IProgramController {
  saveProgramDraft(req: Request, res: Response): Promise<void>;
  saveProgram(req: Request, res: Response): Promise<void>;
  getPrograms(req: Request, res: Response): Promise<void>;
  getProgramsCategories(req: Request, res: Response): Promise<void>;
  getProgramsByParantId(req: Request, res: Response): Promise<void>;
  getAllPrograms(req: Request, res: Response): Promise<Response<ProgramDto[]>>;
  findProgram(req: Request, res: Response): Promise<Response<ProgramDto>>;
  updateProgram(
    req: Request,
    res: Response
  ): Promise<Response<{ message: string }>>;
}
