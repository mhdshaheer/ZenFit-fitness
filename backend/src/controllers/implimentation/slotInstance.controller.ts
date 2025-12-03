import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { ISlotInstanceController } from "../interface/slotInstance.controller.interface";
import { TYPES } from "../../shared/types/inversify.types";
import {
    ISlotInstanceService,
    TrainerSlotInstanceFilters,
} from "../../services/interface/slotInstance.service.interface";
import { HttpStatus } from "../../const/statuscode.const";

@injectable()
export class SlotInstanceController implements ISlotInstanceController {
    @inject(TYPES.SlotInstanceService)
    private readonly _slotInstanceService!: ISlotInstanceService;

    async getInstances(req: Request, res: Response): Promise<Response<any>> {
        const trainerId = (req as any).user.id as string;
        const {
            from,
            to,
            segment,
            status,
            search,
            page,
            limit,
            programIds,
        } = req.query;

        const filters: TrainerSlotInstanceFilters = {
            segment: segment === "past" ? "past" : "upcoming",
            from: typeof from === "string" ? new Date(from) : undefined,
            to: typeof to === "string" ? new Date(to) : undefined,
            status: typeof status === "string" ? (status as any) : undefined,
            search: typeof search === "string" ? search : undefined,
            page: typeof page === "string" ? parseInt(page, 10) : undefined,
            limit: typeof limit === "string" ? parseInt(limit, 10) : undefined,
        };

        if (programIds) {
            if (Array.isArray(programIds)) {
                filters.programIds = programIds as string[];
            } else if (typeof programIds === "string") {
                filters.programIds = programIds.split(",").map((id) => id.trim());
            }
        }

        const instances = await this._slotInstanceService.getTrainerInstancesWithFilters(
            trainerId,
            filters
        );
        return res.status(HttpStatus.OK).json(instances);
    }

    async generateForTemplate(
        req: Request,
        res: Response
    ): Promise<Response<any>> {
        const templateId = req.params.templateId;
        const daysAhead = req.body.daysAhead ?? 10;

        await this._slotInstanceService.generateFutureInstancesForTemplate(
            templateId,
            daysAhead
        );

        return res.status(HttpStatus.OK).json({ success: true });
    }

    async getInstancesForProgram(
        req: Request,
        res: Response
    ): Promise<Response<any>> {
        const { programId, from, to, page, limit } = req.query;

        if (!programId || typeof programId !== "string") {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ message: "programId is required" });
        }

        const fromDate = from ? new Date(from as string) : undefined;
        const toDate = to ? new Date(to as string) : undefined;
        const pageNumber = page ? parseInt(page as string, 10) : undefined;
        const limitNumber = limit ? parseInt(limit as string, 10) : undefined;

        const instances = await this._slotInstanceService.getInstancesForProgram(
            programId,
            fromDate,
            toDate,
            pageNumber,
            limitNumber
        );

        return res.status(HttpStatus.OK).json(instances);
    }

    async cancelInstance(req: Request, res: Response): Promise<Response<any>> {
        const trainerId = (req as any).user.id as string;
        const instanceId = req.params.id;

        const updated = await this._slotInstanceService.cancelInstance(
            instanceId,
            trainerId
        );

        return res.status(HttpStatus.OK).json(updated);
    }
}
