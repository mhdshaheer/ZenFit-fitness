import { injectable } from "inversify";
import { HydratedDocument, Types } from "mongoose";
import { BaseRepository } from "../base.repository";
import { ISlotInstance, SlotInstanceModel } from "../../models/slotInstance.model";
import {
    ISlotInstanceRepository,
    SlotInstanceQueryOptions,
    TrainerInstanceFilterOptions,
} from "../interface/slotInstance.repository.interface";

@injectable()
export class SlotInstanceRepository
    extends BaseRepository<ISlotInstance>
    implements ISlotInstanceRepository {
    constructor() {
        super(SlotInstanceModel);
    }

    async createInstance(
        data: Partial<ISlotInstance>
    ): Promise<HydratedDocument<ISlotInstance>> {
        const doc = await SlotInstanceModel.create(data);
        return doc as HydratedDocument<ISlotInstance>;
    }

    async bulkUpsertInstances(instances: Partial<ISlotInstance>[]): Promise<void> {
        if (!instances.length) return;

        const operations = instances.map((inst) => ({
            updateOne: {
                filter: {
                    templateId: inst.templateId,
                    date: inst.date,
                },
                update: {
                    $setOnInsert: {
                        ...inst,
                    },
                },
                upsert: true,
            },
        }));

        await SlotInstanceModel.bulkWrite(operations);
    }

    async findById(id: string) {
        return await this.model.findById(id);
    }

    async findByTemplateAndDateRange(
        templateId: string,
        from: Date,
        to: Date
    ): Promise<ISlotInstance[]> {
        return await this.model.find({
            templateId: new Types.ObjectId(templateId),
            date: { $gte: from, $lte: to },
        });
    }

    async findByProgramAndDateRange(
        programId: string,
        from: Date,
        to: Date,
        options?: SlotInstanceQueryOptions
    ): Promise<ISlotInstance[]> {
        const query = this.model
            .find({
                programId: new Types.ObjectId(programId),
                date: { $gte: from, $lte: to },
                status: { $ne: "CANCELLED" },
            })
            .sort({ date: 1, startTime: 1 });

        if (options?.skip) {
            query.skip(options.skip);
        }
        if (options?.limit) {
            query.limit(options.limit);
        }

        return await query;
    }

    async countByProgramAndDateRange(
        programId: string,
        from: Date,
        to: Date
    ): Promise<number> {
        return this.model.countDocuments({
            programId: new Types.ObjectId(programId),
            date: { $gte: from, $lte: to },
            status: { $ne: "CANCELLED" },
        });
    }

    async findByTrainerAndDateRange(
        trainerId: string,
        from: Date,
        to: Date
    ): Promise<ISlotInstance[]> {
        return await this.model.find({
            trainerId: new Types.ObjectId(trainerId),
            date: { $gte: from, $lte: to },
        });
    }

    async findByTrainerWithFilters(
        trainerId: string,
        filters: TrainerInstanceFilterOptions
    ): Promise<ISlotInstance[]> {
        const query = this.model
            .find(this.buildTrainerFilterQuery(trainerId, filters))
            .sort({
                date: filters.sortOrder ?? 1,
                startTime: filters.sortOrder ?? 1,
            });

        if (typeof filters.skip === "number" && filters.skip > 0) {
            query.skip(filters.skip);
        }
        if (typeof filters.limit === "number" && filters.limit > 0) {
            query.limit(filters.limit);
        }

        return await query;
    }

    async countByTrainerWithFilters(
        trainerId: string,
        filters: TrainerInstanceFilterOptions
    ): Promise<number> {
        return this.model.countDocuments(
            this.buildTrainerFilterQuery(trainerId, filters)
        );
    }

    async updateStatus(
        instanceId: string,
        status: ISlotInstance["status"]
    ): Promise<ISlotInstance | null> {
        return await this.model.findOneAndUpdate(
            { _id: new Types.ObjectId(instanceId) },
            { $set: { status } },
            { new: true }
        );
    }

    async cancelUpcomingByTemplate(
        templateId: string,
        fromDate: Date
    ): Promise<number> {
        const result = await this.model.updateMany(
            {
                templateId: new Types.ObjectId(templateId),
                date: { $gte: fromDate },
                status: { $ne: "CANCELLED" },
            },
            { $set: { status: "CANCELLED" } }
        );
        return result.modifiedCount ?? 0;
    }

    async decrementCapacityAtomically(id: string) {
        return await this.model.findOneAndUpdate(
            {
                _id: new Types.ObjectId(id),
                availableCapacity: { $gt: 0 },
                status: "OPEN",
            },
            { $inc: { availableCapacity: -1 } },
            { new: true }
        );
    }

    async incrementCapacity(id: string, amount: number = 1): Promise<void> {
        await this.model.updateOne(
            { _id: new Types.ObjectId(id) },
            { $inc: { availableCapacity: amount } }
        );
    }

    private buildTrainerFilterQuery(
        trainerId: string,
        filters: TrainerInstanceFilterOptions
    ) {
        const andConditions: Record<string, any>[] = [
            { trainerId: new Types.ObjectId(trainerId) },
            { date: { $gte: filters.from, $lte: filters.to } },
        ];

        if (filters.status) {
            andConditions.push({ status: filters.status });
        }

        if (filters.programIds && filters.programIds.length) {
            andConditions.push({
                programId: {
                    $in: filters.programIds.map((id) => new Types.ObjectId(id)),
                },
            });
        }

        const { segment, currentDayStart, currentTimeString } = filters;
        if (segment && currentDayStart && currentTimeString) {
            const boundary = new Date(currentDayStart);
            const isWithinRange =
                filters.from.getTime() <= boundary.getTime() &&
                filters.to.getTime() >= boundary.getTime();

            if (isWithinRange) {
                if (segment === "upcoming") {
                    andConditions.push({
                        $or: [
                            { date: { $gt: boundary } },
                            {
                                date: boundary,
                                startTime: { $gte: currentTimeString },
                            },
                        ],
                    });
                } else if (segment === "past") {
                    andConditions.push({
                        $or: [
                            { date: { $lt: boundary } },
                            {
                                date: boundary,
                                startTime: { $lt: currentTimeString },
                            },
                        ],
                    });
                }
            }
        }

        if (andConditions.length === 1) {
            return andConditions[0];
        }

        return { $and: andConditions };
    }
}
