import { Request, Response } from "express";
import { IProfileController } from "../interface/profile.controller.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../types/inversify.types";
import { HttpStatus } from "../../const/statuscode.const";
import { IProfileService } from "../../services/interface/profile.service.interface";

@injectable()
export class ProfileController implements IProfileController {
  constructor(
    @inject(TYPES.ProfileService) private profileService: IProfileService
  ) {}

  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.query.id || (req as any).user.id;
    console.log("id from the query ", req.query);
    let profile = await this.profileService.getProfile(userId);
    res.status(HttpStatus.OK).json(profile);
    return;
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    let profileData = req.body;
    let updatedProfile = await this.profileService.updateProfile(
      userId,
      profileData
    );
    console.log("Updated profile on controller :", updatedProfile);
    res.status(HttpStatus.OK).json(updatedProfile);
    return;
  }

  async verifyResume(req: Request, res: Response): Promise<void> {
    console.log("requested user id :", req.body);
    const userId = req.body.id;
    const resumeVerified = await this.profileService.verifyResume(userId);
    res.status(HttpStatus.OK).json({ isVerified: resumeVerified });
    return;
  }
}
