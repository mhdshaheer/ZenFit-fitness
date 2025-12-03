import { Schema, Document, Types, model } from "mongoose";

export interface ISlotInstance extends Document {
    templateId: Types.ObjectId;
    date: Date; // specific calendar day
    startTime: string;
    endTime: string;
    capacity: number;
    availableCapacity: number;
    programId: Types.ObjectId;
    trainerId: Types.ObjectId;
    timezone: string;
    status: "OPEN" | "CLOSED" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
}

const SlotInstanceSchema = new Schema<ISlotInstance>(
    {
        templateId: {
            type: Schema.Types.ObjectId,
            ref: "SlotTemplate",
            required: true,
        },
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        capacity: { type: Number, required: true, min: 1 },
        availableCapacity: { type: Number, required: true, min: 0 },
        programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
        trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
        timezone: { type: String, required: true },
        status: {
            type: String,
            enum: ["OPEN", "CLOSED", "CANCELLED"],
            default: "OPEN",
        },
    },
    { timestamps: true }
);

SlotInstanceSchema.index({ templateId: 1, date: 1 }, { unique: true });
SlotInstanceSchema.index({ trainerId: 1, date: 1 });
SlotInstanceSchema.index({ status: 1 });

export const SlotInstanceModel = model<ISlotInstance>(
    "SlotInstance",
    SlotInstanceSchema
);
