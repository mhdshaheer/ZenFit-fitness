import { Schema, Document, Types, model } from "mongoose";

export type RecurrenceType = "DAILY" | "WEEKLY" | "CUSTOM";

export interface ISlotTemplate extends Document {
    trainerId: Types.ObjectId;
    programId: Types.ObjectId;
    recurrence: {
        type: RecurrenceType;
        daysOfWeek?: string[]; // for WEEKLY, e.g. ["Mon", "Wed"]
        intervalDays?: number; // for DAILY, every N days
        specificDates?: Date[]; // for CUSTOM, explicit dates if needed
    };
    startTime: string; // e.g. "07:00"
    endTime: string;   // e.g. "08:00"
    capacity: number;
    timezone: string;
    isActive: boolean;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const SlotTemplateSchema = new Schema<ISlotTemplate>(
    {
        trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
        programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
        recurrence: {
            type: {
                type: String,
                enum: ["DAILY", "WEEKLY", "CUSTOM"],
                required: true,
            },
            daysOfWeek: { type: [String], default: undefined },
            intervalDays: { type: Number, default: 1 },
            specificDates: { type: [Date], default: undefined },
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        capacity: { type: Number, required: true, min: 1 },
        timezone: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date, default: undefined },
    },
    { timestamps: true }
);

SlotTemplateSchema.index({ trainerId: 1, programId: 1 });
SlotTemplateSchema.index({ isActive: 1 });

export const SlotTemplateModel = model<ISlotTemplate>(
    "SlotTemplate",
    SlotTemplateSchema
);
