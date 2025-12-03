import { injectable } from "inversify";
import { Types } from "mongoose";
import { BaseRepository } from "../base.repository";
import { ISlotTemplate, SlotTemplateModel } from "../../models/slotTemplate.model";
import { ISlotTemplateRepository } from "../interface/slotTemplate.repository.interface";

@injectable()
export class SlotTemplateRepository
    extends BaseRepository<ISlotTemplate>
    implements ISlotTemplateRepository {
    constructor() {
        super(SlotTemplateModel);
    }

    async createTemplate(data: Partial<ISlotTemplate>): Promise<ISlotTemplate> {
        return await this.create(data);
    }

    async updateTemplate(
        id: string,
        data: Partial<ISlotTemplate>
    ): Promise<ISlotTemplate | null> {
        return await this.update(id, data);
    }

    async findById(id: string): Promise<ISlotTemplate | null> {
        return await this.model.findById(id);
    }

    async findActiveByTrainer(trainerId: string): Promise<ISlotTemplate[]> {
        return await this.model.find({
            trainerId: new Types.ObjectId(trainerId),
            isDeleted: false,
        });
    }

    async softDelete(templateId: string): Promise<ISlotTemplate | null> {
        return await this.update(templateId, {
            isDeleted: true,
            isActive: false,
            deletedAt: new Date(),
        });
    }
}
