import { Request, Response } from "express";
import { FileService } from "../../services/implimentation/s3.service";
import { IFileController } from "../interface/s3.controller.interface";
import { inject, injectable } from "inversify";
import { IFileService } from "../../services/interface/s3.service.interface";
import { TYPES } from "../../types/inversify.types";

@injectable()
export class FileController implements IFileController {
  private fileService: IFileService;

  constructor(@inject(TYPES.FileService) fileService: IFileService) {
    this.fileService = fileService;
  }

  async upload(req: Request, res: Response): Promise<void> {
    try {
      console.log("request for upload:", req);
      console.log("request for upload:", req.user);
      const { role, type, id } = req.body;
      const file = req.file as Express.Multer.File;

      if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const key = await this.fileService.upload(role, type, id, file);
      res.status(200).json({ key });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Upload failed" });
    }
  }

  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      let newKey = `user/profile/${key}`;
      console.log("key from the frontend: ", key);
      console.log("newkey : ", newKey);
      const url = await this.fileService.getUrl(newKey);
      res.status(200).json({ url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  }

  async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      await this.fileService.delete(key);
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  }
}
