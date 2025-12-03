import { ISlotInstance } from "../../models/slotInstance.model";
import {
    SlotInstancePaginatedDto,
    SlotInstancePaginationMeta,
} from "../../dtos/slotInstance.dtos";

export type SlotInstancePaginatedResult = SlotInstancePaginatedDto;

export interface TrainerSlotInstanceFilters {
    segment?: "upcoming" | "past";
    from?: Date;
    to?: Date;
    status?: ISlotInstance["status"];
    search?: string;
    programIds?: string[];
    page?: number;
    limit?: number;
}

export interface ISlotInstanceService {
    generateFutureInstancesForTemplate(
        templateId: string,
        daysAhead: number
    ): Promise<void>;
    getInstancesByDateRange(
        trainerId: string,
        from: Date,
        to: Date
    ): Promise<ISlotInstance[]>;
    getInstancesForProgram(
        programId: string,
        from?: Date,
        to?: Date,
        page?: number,
        limit?: number
    ): Promise<SlotInstancePaginatedResult>;
    getTrainerInstancesWithFilters(
        trainerId: string,
        filters: TrainerSlotInstanceFilters
    ): Promise<SlotInstancePaginatedResult>;
    cancelInstance(
        instanceId: string,
        trainerId: string
    ): Promise<ISlotInstance>;
    cancelFutureInstancesForTemplate(
        templateId: string,
        trainerId: string
    ): Promise<number>;
}
