import { Request, Response } from "express";
import { IProfileController } from "../interface/profile.controller.interface";

export class ProfileController implements IProfileController {
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    console.log("GetProfile user: ", userId);
  }
}
