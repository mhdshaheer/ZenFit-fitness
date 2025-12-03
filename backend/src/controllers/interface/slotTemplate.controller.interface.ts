import { Request, Response } from "express";

export interface ISlotTemplateController {
    createTemplate(req: Request, res: Response): Promise<Response<any>>;
    updateTemplate(req: Request, res: Response): Promise<Response<any>>;
    getTemplates(req: Request, res: Response): Promise<Response<any>>;
    deleteTemplate(req: Request, res: Response): Promise<Response<any>>;
}
