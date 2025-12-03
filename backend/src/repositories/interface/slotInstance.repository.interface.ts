import { HydratedDocument } from "mongoose";
import { ISlotInstance } from "../../models/slotInstance.model";

export interface SlotInstanceQueryOptions {
    skip?: number;
    limit?: number;
}

export interface TrainerInstanceFilterOptions {
    from: Date;
    to: Date;
    status?: ISlotInstance["status"];
    programIds?: string[];
    skip?: number;
    limit?: number;
    sortOrder?: 1 | -1;
    segment?: "upcoming" | "past";
    currentDayStart?: Date;
    currentTimeString?: string;
}

export interface ISlotInstanceRepository {
    createInstance(
        data: Partial<ISlotInstance>
    ): Promise<HydratedDocument<ISlotInstance>>;
    bulkUpsertInstances(
        instances: Partial<ISlotInstance>[]
    ): Promise<void>;
    findById(id: string): Promise<HydratedDocument<ISlotInstance> | null>;
    findByTemplateAndDateRange(
        templateId: string,
        from: Date,
        to: Date
    ): Promise<ISlotInstance[]>;
    findByProgramAndDateRange(
        programId: string,
        from: Date,
        to: Date,
        options?: SlotInstanceQueryOptions
    ): Promise<ISlotInstance[]>;
    findByTrainerAndDateRange(
        trainerId: string,
        from: Date,
        to: Date
    ): Promise<ISlotInstance[]>;
    findByTrainerWithFilters(
        trainerId: string,
        filters: TrainerInstanceFilterOptions
    ): Promise<ISlotInstance[]>;
    countByTrainerWithFilters(
        trainerId: string,
        filters: TrainerInstanceFilterOptions
    ): Promise<number>;
    updateStatus(
        instanceId: string,
        status: ISlotInstance['status']
    ): Promise<ISlotInstance | null>;
    cancelUpcomingByTemplate(
        templateId: string,
        fromDate: Date
    ): Promise<number>;
    decrementCapacityAtomically(
        id: string
    ): Promise<HydratedDocument<ISlotInstance> | null>;
    incrementCapacity(id: string, amount?: number): Promise<void>;
    countByProgramAndDateRange(
        programId: string,
        from: Date,
        to: Date
    ): Promise<number>;
}
