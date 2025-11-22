import { Request, Response } from "express";
import { IProfileController } from "../interface/profile.controller.interface";
import { inject, injectable } from "inversify";
import { HttpStatus } from "../../const/statuscode.const";
import { IProfileService } from "../../services/interface/profile.service.interface";
import { HttpResponse } from "../../const/response_message.const";
import { TYPES } from "../../shared/types/inversify.types";
import { AppError } from "../../shared/utils/appError.util";
import { UserDto } from "../../dtos/user.dtos";
import { ILoggedUser } from "../../interfaces/user.interface";

@injectable()
export class ProfileController implements IProfileController {
  constructor(
    @inject(TYPES.ProfileService)
    private readonly _profileService: IProfileService
  ) {}

  async getUserByUserId(
    req: Request,
    res: Response
  ): Promise<Response<UserDto>> {
    const userId = req.params.userId;
    const userData = await this._profileService.getProfile(userId);
    return res.status(HttpStatus.OK).json(userData);
  }
  async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.query.id || (req as any).user.id;
    const profile = await this._profileService.getProfile(userId);
    res.status(HttpStatus.OK).json(profile);
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    const profileData = req.body;
    const updatedProfile = await this._profileService.updateProfile(
      userId,
      profileData
    );
    res.status(HttpStatus.OK).json(updatedProfile);
  }

  async verifyResume(req: Request, res: Response): Promise<void> {
    const userId = req.body.id;
    const resumeVerified = await this._profileService.verifyResume(userId);
    res.status(HttpStatus.OK).json({ isVerified: resumeVerified });
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    const passwords = req.body;

    const updated = await this._profileService.changePassword(
      userId,
      passwords
    );

    if (updated) {
      res.status(HttpStatus.OK).json({
        message: HttpResponse.PASSWORD_CHANGE_SUCCESS,
      });
    } else {
      throw new AppError(
        HttpResponse.RESET_PASSWORD_FAILED,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async getCurrentUserId(
    req: Request,
    res: Response
  ): Promise<Response<ILoggedUser>> {
    const user = (req as any).user;

    return res.status(HttpStatus.OK).json({ id: user.id, role: user.role });
  }
}
