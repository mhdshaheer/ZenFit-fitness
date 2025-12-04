import { Response } from "express";
import { inject, injectable } from "inversify";
import { ISlotTemplateController } from "../interface/slotTemplate.controller.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { ISlotTemplateService } from "../../services/interface/slotTemplate.service.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";
import { HttpResponse } from "../../const/response_message.const";

@injectable()
export class SlotTemplateController implements ISlotTemplateController {
    @inject(TYPES.SlotTemplateService)
    private readonly _slotTemplateService!: ISlotTemplateService;

    async createTemplate(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response<any>> {
        const trainerId = req.user?.id;
        if (!trainerId) {
            return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message: HttpResponse.UNAUTHORIZED });
        }
        const data = req.body;
        const template = await this._slotTemplateService.createTemplate(
            trainerId,
            data
        );
        return res.status(HttpStatus.CREATED).json(template);
    }

    async updateTemplate(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response<any>> {
        const trainerId = req.user?.id;
        if (!trainerId) {
            return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message: HttpResponse.UNAUTHORIZED });
        }
        const templateId = req.params.id;
        const data = req.body;
        const updated = await this._slotTemplateService.updateTemplate(
            templateId,
            trainerId,
            data
        );
        return res.status(HttpStatus.OK).json(updated);
    }

    async getTemplates(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response<any>> {
        const trainerId = req.user?.id;
        if (!trainerId) {
            return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message: HttpResponse.UNAUTHORIZED });
        }
        const templates = await this._slotTemplateService.getTemplatesByTrainer(
            trainerId
        );
        return res.status(HttpStatus.OK).json(templates);
    }

    async deleteTemplate(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response<any>> {
        const trainerId = req.user?.id;
        if (!trainerId) {
            return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message: HttpResponse.UNAUTHORIZED });
        }
        const templateId = req.params.id;
        const deleted = await this._slotTemplateService.deleteTemplate(
            templateId,
            trainerId
        );
        return res.status(HttpStatus.OK).json(deleted);
    }
}
