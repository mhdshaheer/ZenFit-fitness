import { Request, Response } from "express";

export interface IProgramController {
  saveProgramDraft(req: Request, res: Response): Promise<void>;
}
