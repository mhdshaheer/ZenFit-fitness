import { Request, Response } from "express";
import { IFileController } from "../interface/s3.controller.interface";
import { inject, injectable } from "inversify";
import { IFileService } from "../../services/interface/s3.service.interface";
import { IProfileService } from "../../services/interface/profile.service.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { TYPES } from "../../shared/types/inversify.types";
import { AppError } from "../../shared/utils/appError.util";

@injectable()
export class FileController implements IFileController {
  private fileService: IFileService;
  private profileService: IProfileService;

  constructor(
    @inject(TYPES.FileService) fileService: IFileService,
    @inject(TYPES.ProfileService) profileService: IProfileService
  ) {
    this.fileService = fileService;
    this.profileService = profileService;
  }

  async upload(req: Request, res: Response): Promise<void> {
      const { type } = req.body;
      const { id, role } = (req as any).user;

      const file = req.file as Express.Multer.File;

      if (!file) {
        throw new AppError("No file uploaded" ,HttpStatus.BAD_REQUEST)
      }

      const key = await this.fileService.upload(role, type, id, file);

      if (type == "profile") {
        await this.profileService.updateProfileImage(id, key);
      } else if (type == "resume") {
        await this.profileService.updateResumePdf(id, key);
      }
      const signedUrl = await this.fileService.getSignedUrl(id, type);
      res.status(HttpStatus.OK).json({ key, url: signedUrl });

  }

  async getFile(req: Request, res: Response): Promise<void> {

      const userId = req.query.id || (req as any).user.id;
      const { key } = req.query;
      const type = key?.toString().split("/")[1];
      const signedUrl = await this.fileService.getSignedUrl(userId, type!);
      res.status(HttpStatus.OK).json({ url: signedUrl });
    
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
      const { key } = req.params;
      const userId = await (req as any).user.id;
      const type = key?.toString().split("/")[1];
      await this.fileService.delete(key);
      if (type == "profile") {
        await this.profileService.removeProfileImage(userId);
      } else if (type == "resumes") {
        await this.profileService.removeResumePdf(userId);
      }

      res.status(HttpStatus.OK).json({ message: "Deleted successfully" });
    
  }
}
