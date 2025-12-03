import { Types } from "mongoose";
import { ISlotInstance } from "../models/slotInstance.model";

const toObjectIdString = (value: any): string => {
    if (typeof value === "string") {
        return value;
    }
    if (value instanceof Types.ObjectId) {
        return value.toString();
    }
    return value?.toString?.() ?? "";
};

export interface SlotInstanceDto {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: number;
    availableCapacity: number;
    timezone: string;
    programId: string;
    trainerId: string;
    status: ISlotInstance["status"];
}

export interface SlotInstancePaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
}

export interface SlotInstancePaginatedDto {
    data: SlotInstanceDto[];
    pagination: SlotInstancePaginationMeta;
}

export const toSlotInstanceDto = (instance: ISlotInstance): SlotInstanceDto => ({
    _id: toObjectIdString(instance._id),
    date: instance.date.toISOString(),
    startTime: instance.startTime,
    endTime: instance.endTime,
    capacity: instance.capacity,
    availableCapacity: instance.availableCapacity,
    timezone: instance.timezone,
    programId: toObjectIdString(instance.programId),
    trainerId: toObjectIdString(instance.trainerId),
    status: instance.status,
});

export const toSlotInstancePaginatedDto = (
    result: { data: ISlotInstance[]; pagination: SlotInstancePaginatedDto["pagination"] }
): SlotInstancePaginatedDto => ({
    data: result.data.map(toSlotInstanceDto),
    pagination: result.pagination,
});
