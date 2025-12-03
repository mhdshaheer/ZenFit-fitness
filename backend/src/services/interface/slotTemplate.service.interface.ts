import { ISlotTemplate } from "../../models/slotTemplate.model";
import { SlotTemplateDto } from "../../dtos/slotTemplate.dtos";

export interface ISlotTemplateService {
    createTemplate(
        trainerId: string,
        data: Partial<ISlotTemplate>
    ): Promise<SlotTemplateDto>;
    updateTemplate(
        templateId: string,
        trainerId: string,
        data: Partial<ISlotTemplate>
    ): Promise<SlotTemplateDto>;
    getTemplatesByTrainer(trainerId?: string): Promise<SlotTemplateDto[]>;
    deleteTemplate(
        templateId: string,
        trainerId: string
    ): Promise<SlotTemplateDto>;
}
