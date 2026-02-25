import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface ISlotTemplateController {
    createTemplate(req: AuthenticatedRequest, res: Response): Promise<Response>;
    updateTemplate(req: AuthenticatedRequest, res: Response): Promise<Response>;
    getTemplates(req: AuthenticatedRequest, res: Response): Promise<Response>;
    deleteTemplate(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
