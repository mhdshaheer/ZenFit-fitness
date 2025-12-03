import { inject, injectable } from "inversify";
import { ISlotTemplateService } from "../interface/slotTemplate.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { ISlotTemplateRepository } from "../../repositories/interface/slotTemplate.repository.interface";
import { ISlotTemplate } from "../../models/slotTemplate.model";
import { IProgramRepository } from "../../repositories/interface/program.repository.interface";
import { ISlotInstanceService } from "../interface/slotInstance.service.interface";
import { Types } from "mongoose";
import {
    SlotTemplateDto,
    toSlotTemplateDto,
    toSlotTemplateListDto,
} from "../../dtos/slotTemplate.dtos";

@injectable()
export class SlotTemplateService implements ISlotTemplateService {
    @inject(TYPES.SlotTemplateRepository)
    private readonly _templateRepo!: ISlotTemplateRepository;

    @inject(TYPES.ProgramRespository)
    private readonly _programRepo!: IProgramRepository;

    @inject(TYPES.SlotInstanceService)
    private readonly _instanceService!: ISlotInstanceService;

    private readonly HORIZON_DAYS_DEFAULT = 10;

    async createTemplate(
        trainerId: string,
        data: Partial<ISlotTemplate>
    ): Promise<SlotTemplateDto> {
        if (!data.programId) {
            throw new Error("programId is required");
        }

        const program = await this._programRepo.findProgramById(
            data.programId.toString()
        );
        if (!program || program.trainerId.toString() !== trainerId) {
            throw new Error("Trainer does not own this program");
        }

        const templateData: Partial<ISlotTemplate> = {
            ...data,
            trainerId: new Types.ObjectId(trainerId),
            isActive: data.isActive ?? true,
        };

        const template = await this._templateRepo.createTemplate(templateData);

        await this._instanceService.generateFutureInstancesForTemplate(
            (template as any)._id.toString(),
            this.HORIZON_DAYS_DEFAULT
        );

        return toSlotTemplateDto(template);
    }

    async updateTemplate(
        templateId: string,
        trainerId: string,
        data: Partial<ISlotTemplate>
    ): Promise<SlotTemplateDto> {
        const existing = await this._templateRepo.findById(templateId);
        if (!existing) {
            throw new Error("Slot template not found");
        }
        if (existing.trainerId.toString() !== trainerId) {
            throw new Error("Not authorized to update this template");
        }

        if (
            data.programId &&
            data.programId.toString() !== existing.programId.toString()
        ) {
            const program = await this._programRepo.findProgramById(
                data.programId.toString()
            );
            if (!program || program.trainerId.toString() !== trainerId) {
                throw new Error("Trainer does not own this program");
            }
        }

        const updated = await this._templateRepo.updateTemplate(templateId, data);
        if (!updated) {
            throw new Error("Failed to update slot template");
        }

        await this._instanceService.generateFutureInstancesForTemplate(
            templateId,
            this.HORIZON_DAYS_DEFAULT
        );

        return toSlotTemplateDto(updated);
    }

    async getTemplatesByTrainer(trainerId: string): Promise<SlotTemplateDto[]> {
        const templates = await this._templateRepo.findActiveByTrainer(trainerId);
        return toSlotTemplateListDto(templates);
    }

    async deleteTemplate(
        templateId: string,
        trainerId: string
    ): Promise<SlotTemplateDto> {
        const template = await this._templateRepo.findById(templateId);
        if (!template || template.isDeleted) {
            throw new Error("Slot template not found");
        }

        if (template.trainerId.toString() !== trainerId) {
            throw new Error("Not authorized to delete this template");
        }

        await this._instanceService.cancelFutureInstancesForTemplate(
            templateId,
            trainerId
        );

        const deleted = await this._templateRepo.softDelete(templateId);
        if (!deleted) {
            throw new Error("Failed to delete slot template");
        }

        return toSlotTemplateDto(deleted);
    }
}
