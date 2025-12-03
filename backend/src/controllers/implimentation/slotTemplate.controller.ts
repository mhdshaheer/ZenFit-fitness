import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { ISlotTemplateController } from "../interface/slotTemplate.controller.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { ISlotTemplateService } from "../../services/interface/slotTemplate.service.interface";
import { HttpStatus } from "../../const/statuscode.const";

@injectable()
export class SlotTemplateController implements ISlotTemplateController {
    @inject(TYPES.SlotTemplateService)
    private readonly _slotTemplateService!: ISlotTemplateService;

    async createTemplate(req: Request, res: Response): Promise<Response<any>> {
        const trainerId = (req as any).user.id as string;
        const data = req.body;
        const template = await this._slotTemplateService.createTemplate(
            trainerId,
            data
        );
        return res.status(HttpStatus.OK).json(template);
    }

    async updateTemplate(req: Request, res: Response): Promise<Response<any>> {
        const trainerId = (req as any).user.id as string;
        const templateId = req.params.id;
        const data = req.body;
        const updated = await this._slotTemplateService.updateTemplate(
            templateId,
            trainerId,
            data
        );
        return res.status(HttpStatus.OK).json(updated);
    }

    async getTemplates(req: Request, res: Response): Promise<Response<any>> {
        const trainerId = (req as any).user.id as string;
        const templates = await this._slotTemplateService.getTemplatesByTrainer(
            trainerId
        );
        return res.status(HttpStatus.OK).json(templates);
    }

    async deleteTemplate(req: Request, res: Response): Promise<Response<any>> {
        const trainerId = (req as any).user.id as string;
        const templateId = req.params.id;
        const deleted = await this._slotTemplateService.deleteTemplate(
            templateId,
            trainerId
        );
        return res.status(HttpStatus.OK).json(deleted);
    }
}
