import { injectable } from "inversify";
import { S3Repository } from "../../repositories/implimentation/s3.repository";
import { IS3Repository } from "../../repositories/interface/s3.repository.interface";
import { IFileService } from "../interface/s3.service.interface";

@injectable()
export class FileService implements IFileService {
  private s3Repository: IS3Repository;

  constructor(s3Repository: IS3Repository = new S3Repository()) {
    this.s3Repository = s3Repository;
  }

  async upload(
    role: "user" | "trainer" | "admin" | "course",
    type: string,
    id: string,
    file: Express.Multer.File
  ): Promise<string> {
    console.log("Upload service 1");
    const folderMap: Record<string, string> = {
      profile: "profile",
      resume: "resumes",
      thumbnail: "thumbnails",
      material: "materials",
      report: "reports",
    };

    const folder = folderMap[type] || "misc";
    const key = `${role}/${folder}/${id}-${Date.now()}`;
    // const key = `${folder}/${id}-${Date.now()}`;

    console.log("Upload service 2-key : ", key);
    await this.s3Repository.uploadFile(key, file.buffer, file.mimetype);
    console.log("Upload service 3-key :", key);
    return key;
  }

  async getUrl(key: string): Promise<string> {
    return this.s3Repository.getFileUrl(key);
  }

  async delete(key: string): Promise<void> {
    return this.s3Repository.deleteFile(key);
  }
}
