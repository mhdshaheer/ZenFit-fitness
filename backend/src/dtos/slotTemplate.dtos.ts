import { Types } from "mongoose";
import { ISlotTemplate } from "../models/slotTemplate.model";

const toObjectIdString = (value: any): string => {
    if (typeof value === "string") {
        return value;
    }
    if (value instanceof Types.ObjectId) {
        return value.toString();
    }
    return value?.toString?.() ?? "";
};

export interface SlotTemplateRecurrenceDto {
    type: ISlotTemplate["recurrence"]["type"];
    daysOfWeek?: string[];
    intervalDays?: number;
    specificDates?: string[];
}

export interface SlotTemplateDto {
    _id: string;
    trainerId: string;
    programId: string;
    recurrence: SlotTemplateRecurrenceDto;
    startTime: string;
    endTime: string;
    capacity: number;
    timezone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const normalizeSpecificDates = (dates?: (Date | string)[]): string[] | undefined => {
    if (!dates || !dates.length) {
        return undefined;
    }
    return dates
        .map((value) => (value instanceof Date ? value : new Date(value)))
        .filter((date) => !Number.isNaN(date.getTime()))
        .map((date) => date.toISOString());
};

export const toSlotTemplateDto = (template: ISlotTemplate): SlotTemplateDto => ({
    _id: toObjectIdString(template._id),
    trainerId: toObjectIdString(template.trainerId),
    programId: toObjectIdString(template.programId),
    recurrence: {
        type: template.recurrence?.type ?? "WEEKLY",
        daysOfWeek: template.recurrence?.daysOfWeek,
        intervalDays: template.recurrence?.intervalDays,
        specificDates: normalizeSpecificDates(template.recurrence?.specificDates as any),
    },
    startTime: template.startTime,
    endTime: template.endTime,
    capacity: template.capacity,
    timezone: template.timezone,
    isActive: template.isActive,
    createdAt: template.createdAt?.toISOString() ?? new Date().toISOString(),
    updatedAt: template.updatedAt?.toISOString() ?? new Date().toISOString(),
});

export const toSlotTemplateListDto = (templates: ISlotTemplate[]): SlotTemplateDto[] =>
    templates.map(toSlotTemplateDto);
