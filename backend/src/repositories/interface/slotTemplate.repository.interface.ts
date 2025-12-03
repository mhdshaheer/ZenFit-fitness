import { HydratedDocument } from "mongoose";
import { ISlotTemplate } from "../../models/slotTemplate.model";

export interface ISlotTemplateRepository {
    createTemplate(data: Partial<ISlotTemplate>): Promise<ISlotTemplate>;
    updateTemplate(
        id: string,
        data: Partial<ISlotTemplate>
    ): Promise<ISlotTemplate | null>;
    findById(id: string): Promise<ISlotTemplate | null>;
    findActiveByTrainer(trainerId?: string): Promise<ISlotTemplate[]>;
    softDelete(templateId: string): Promise<ISlotTemplate | null>;
}
