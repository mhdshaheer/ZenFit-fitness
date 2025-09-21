import { Request, Response } from "express";

export interface IProgramController {
  saveProgramDraft(req: Request, res: Response): Promise<void>;
  saveProgram(req: Request, res: Response): Promise<void>;
  getPrograms(req: Request, res: Response): Promise<void>;
  getProgramsCategories(req: Request, res: Response): Promise<void>;
  getProgramsByParantId(req: Request, res: Response): Promise<void>;
}
