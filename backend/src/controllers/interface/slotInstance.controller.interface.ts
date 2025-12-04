import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";
import { SlotInstancePaginatedResult } from "../../services/interface/slotInstance.service.interface";
import { ISlotInstance } from "../../models/slotInstance.model";

export interface ISlotInstanceController {
    getInstances(req: AuthenticatedRequest, res: Response): Promise<Response<SlotInstancePaginatedResult>>;
    generateForTemplate(req: Request, res: Response): Promise<Response<{ success: boolean }>>;
    getInstancesForProgram(req: Request, res: Response): Promise<Response<SlotInstancePaginatedResult>>;
    cancelInstance(req: AuthenticatedRequest, res: Response): Promise<Response<ISlotInstance>>;
}
