import { inject } from "inversify";
import { ISlotController } from "../interface/slot.controller.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { ISlotService } from "../../services/interface/slot.service.interface";
import { Request, Response } from "express";
import { HttpStatus } from "../../const/statuscode.const";
import { SlotDisplyDto } from "../../dtos/slot.dtos";
import { ISlotListForUser } from "../../interfaces/slot.interface";

export class SlotController implements ISlotController {
  @inject(TYPES.SlotService)
  private readonly _slotService!: ISlotService;

  async createSlot(
    req: Request,
    res: Response
  ): Promise<Response<SlotDisplyDto>> {
    const trainerId = (req as any).user.id;
    const slotData = { trainerId, ...req.body };
    const createdSlot = await this._slotService.createSlot(slotData);
    return res.status(HttpStatus.OK).json(createdSlot);
  }

  async getSlotsByTrainerId(
    req: Request,
    res: Response
  ): Promise<Response<SlotDisplyDto[]>> {
    const trainerId = (req as any).user.id;
    const slots = await this._slotService.getSlotsByTrainerId(trainerId);
    return res.status(HttpStatus.OK).json(slots);
  }

  async updateSlot(
    req: Request,
    res: Response
  ): Promise<Response<SlotDisplyDto>> {
    const slotData = req.body;
    const slotId = req.params.slotId;
    const updatedSlot = await this._slotService.updateSlot(slotId, slotData);
    return res.status(HttpStatus.OK).json(updatedSlot);
  }

  async updateSlotStatus(
    req: Request,
    res: Response
  ): Promise<Response<SlotDisplyDto>> {
    const slotId = req.params.slotId;
    const slotStatus = req.body.status;
    const updateSlot = await this._slotService.updateSlotStatus(
      slotId,
      slotStatus
    );
    return res.status(HttpStatus.OK).json(updateSlot);
  }
  async getSlotOnUser(
    req: Request,
    res: Response
  ): Promise<Response<ISlotListForUser[]>> {
    const programId = req.params.programId;

    const slots = await this._slotService.getSlotOnUser(programId);
    return res.status(HttpStatus.OK).json(slots);
  }
}
