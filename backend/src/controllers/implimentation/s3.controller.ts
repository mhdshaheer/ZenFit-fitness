import { Request, Response } from "express";
import { FileService } from "../../services/implimentation/s3.service";
import { IFileController } from "../interface/s3.controller.interface";
import { inject, injectable } from "inversify";
import { IFileService } from "../../services/interface/s3.service.interface";
import { TYPES } from "../../types/inversify.types";
import { IProfileService } from "../../services/interface/profile.service.interface";
import { HttpStatus } from "../../const/statuscode.const";

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
    try {
      // console.log("request for upload:", (req as any).user);
      const { role, type } = req.body;
      const { id } = (req as any).user;

      const file = req.file as Express.Multer.File;

      if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const key = await this.fileService.upload(role, type, id, file);

      await this.profileService.updateProfileImage(id, key);
      const signedUrl = await this.fileService.getSignedUrl(id);
      res.status(HttpStatus.OK).json({ key, url: signedUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed" });
    }
  }

  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.id;
      console.log("get file url :", userId);
      const signedUrl = await this.fileService.getSignedUrl(userId);
      res.status(HttpStatus.OK).json({ url: signedUrl });
    } catch (error: any) {
      console.error(error);
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: error.message || "Failed to fetch file" });
    }
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      await this.fileService.delete(key);
      await this.profileService.removeProfileImage(req.body.id); // check id is valid or not
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  }
}
