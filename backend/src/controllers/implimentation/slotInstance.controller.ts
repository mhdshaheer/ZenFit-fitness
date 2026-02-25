import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { ISlotInstanceController } from "../interface/slotInstance.controller.interface";
import { TYPES } from "../../shared/types/inversify.types";
import {
    ISlotInstanceService,
    SlotInstancePaginatedResult,
    TrainerSlotInstanceFilters,
} from "../../services/interface/slotInstance.service.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";
import { HttpResponse } from "../../const/response_message.const";
import { ISlotInstance } from "../../models/slotInstance.model";

@injectable()
export class SlotInstanceController implements ISlotInstanceController {
    @inject(TYPES.SlotInstanceService)
    private readonly _slotInstanceService!: ISlotInstanceService;

    async getInstances(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response<SlotInstancePaginatedResult>> {
        const trainerId = req.user?.id;
        if (trainerId === undefined) {
            return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message: HttpResponse.UNAUTHORIZED });
        }
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
            status:
                typeof status === "string" && (status === "OPEN" || status === "CLOSED")
                    ? (status as "OPEN" | "CLOSED")
                    : undefined,
            search: typeof search === "string" ? search : undefined,
            page: typeof page === "string" ? Number.parseInt(page, 10) : undefined,
            limit: typeof limit === "string" ? Number.parseInt(limit, 10) : undefined,
        };

        if (programIds !== undefined && programIds !== null) {
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
    ): Promise<Response<{ success: boolean }>> {
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
    ): Promise<Response<SlotInstancePaginatedResult>> {
        const { programId, from, to, page, limit } = req.query;

        if (typeof programId !== "string" || programId === "") {
            return res
                .status(HttpStatus.BAD_REQUEST)
                .json({ message: "programId is required" });
        }

        const fromDate = typeof from === "string" && from !== "" ? new Date(from) : undefined;
        const toDate = typeof to === "string" && to !== "" ? new Date(to) : undefined;
        const pageNumber = typeof page === "string" && page !== "" ? parseInt(page, 10) : undefined;
        const limitNumber = typeof limit === "string" && limit !== "" ? parseInt(limit, 10) : undefined;

        const instances = await this._slotInstanceService.getInstancesForProgram(
            programId,
            fromDate,
            toDate,
            pageNumber,
            limitNumber
        );

        return res.status(HttpStatus.OK).json(instances);
    }

    async cancelInstance(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response<ISlotInstance>> {
        const trainerId = req.user?.id;
        if (trainerId === undefined) {
            return res
                .status(HttpStatus.UNAUTHORIZED)
                .json({ message: HttpResponse.UNAUTHORIZED });
        }
        const instanceId = req.params.id;

        const updated = await this._slotInstanceService.cancelInstance(
            instanceId,
            trainerId
        );

        return res.status(HttpStatus.OK).json(updated);
    }
}
