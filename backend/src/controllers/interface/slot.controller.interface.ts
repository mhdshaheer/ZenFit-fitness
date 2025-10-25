import { Request, Response } from "express";
import { SlotDisplyDto } from "../../dtos/slot.dtos";

export interface ISlotController {
  createSlot(req: Request, res: Response): Promise<Response<SlotDisplyDto>>;
  getSlotsByTrainerId(
    req: Request,
    res: Response
  ): Promise<Response<SlotDisplyDto[]>>;
  updateSlot(req: Request, res: Response): Promise<Response<SlotDisplyDto>>;
  updateSlotStatus(
    req: Request,
    res: Response
  ): Promise<Response<SlotDisplyDto>>;
}
