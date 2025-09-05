import { injectable } from "inversify";
import { S3Repository } from "../../repositories/implimentation/s3.repository";
import { IS3Repository } from "../../repositories/interface/s3.repository.interface";
import { IFileService } from "../interface/s3.service.interface";
import { UserRepository } from "../../repositories/implimentation/user.repository";
import { env } from "../../config/env.config";
import { v4 as uuid } from "uuid";

@injectable()
export class FileService implements IFileService {
  private s3Repository: IS3Repository;
  private userRepository = new UserRepository();

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
    const key = `${role}/${folder}/${id}/${uuid()}`;
    await this.s3Repository.uploadFile(key, file.buffer, file.mimetype);
    return key;
  }

  async getSignedUrl(userId: string): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.profileImage) {
      throw new Error("Profile image not found");
    }

    // Generate signed URL
    return this.s3Repository.getFileUrl(user.profileImage, 3600);
  }

  async delete(key: string): Promise<void> {
    return this.s3Repository.deleteFile(key);
  }
}
