import { inject, injectable } from "inversify";
import { ISlot } from "../../models/slot.model";
import { ISlotService } from "../interface/slot.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { ISlotRepository } from "../../repositories/interface/slot.repository.interface";
import { mapToSlotDisplayDto } from "../../mapper/slot.mapper";
import { SlotDisplyDto } from "../../dtos/slot.dtos";
import {
  ISlotListForUser,
  ISlotPopulated,
  ISlotStatus,
} from "../../interfaces/slot.interface";

@injectable()
export class SlotService implements ISlotService {
  @inject(TYPES.SlotRepository)
  private readonly _slotRepository!: ISlotRepository;

  async createSlot(slotData: Partial<ISlot>): Promise<SlotDisplyDto> {
    const createdData = await this._slotRepository.createSlot(slotData);
    const mappedSlot = mapToSlotDisplayDto(createdData);
    return mappedSlot;
  }
  async getSlotsByTrainerId(trainerId: string): Promise<SlotDisplyDto[]> {
    const slots = await this._slotRepository.getSlotByTrainerId(trainerId);
    const mappedSlots = slots.map(mapToSlotDisplayDto);
    return mappedSlots;
  }
  async updateSlot(
    slotId: string,
    slotData: Partial<ISlot>
  ): Promise<SlotDisplyDto> {
    const updatedSlot = await this._slotRepository.updateSlot(slotId, slotData);
    const mappedSlot = mapToSlotDisplayDto(updatedSlot);
    return mappedSlot;
  }
  async updateSlotStatus(
    slotId: string,
    slotStatus: ISlotStatus
  ): Promise<SlotDisplyDto> {
    const updatedSlot = await this._slotRepository.updateSlotStatus(
      slotId,
      slotStatus
    );
    const mappedSlot = mapToSlotDisplayDto(updatedSlot);
    return mappedSlot;
  }
  async getSlotOnUser(programId: string): Promise<ISlotListForUser[]> {
    const slots = await this._slotRepository.getProgramSlotListOnUser(
      programId
    );
    return slots;
  }

  async getSlotBySlotId(slotId: string): Promise<ISlotPopulated> {
    const slot = await this._slotRepository.getSlotBySlotId(slotId);
    return slot;
  }
}
