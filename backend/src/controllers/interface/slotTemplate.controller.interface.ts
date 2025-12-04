import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface ISlotTemplateController {
    createTemplate(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
    updateTemplate(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
    getTemplates(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
    deleteTemplate(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
}
