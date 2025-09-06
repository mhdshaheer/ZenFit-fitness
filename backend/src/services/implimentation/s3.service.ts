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
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.profileImage && type == "profile") {
      console.log("Deleting old image from S3:", user.profileImage);
      await this.s3Repository.deleteFile(user.profileImage);
    }
    if (user.resume && type == "resume") {
      console.log("Deleting old resume from S3:", user.resume);
      await this.s3Repository.deleteFile(user.resume);
      // logic for delete already existing resume
    }

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

  async getSignedUrl(
    userId: string,
    type: string | undefined
  ): Promise<string> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.profileImage) {
      throw new Error("Profile image not found");
    }
    if (type == "profile") {
      return this.s3Repository.getFileUrl(user.profileImage, 3600);
    } else if (type == "resumes") {
      return this.s3Repository.getFileUrl(user.resume!, 3600);
    }
    return "";
  }

  async delete(key: string): Promise<void> {
    return this.s3Repository.deleteFile(key);
  }
}
