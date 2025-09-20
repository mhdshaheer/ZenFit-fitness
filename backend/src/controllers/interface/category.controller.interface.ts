import { Request, Response } from "express";

export interface ICategoryController {
  findAllCategory(req: Request, res: Response): Promise<void>;
}
