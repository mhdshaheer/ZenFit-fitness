import { inject, injectable } from "inversify";
import { IFileService } from "../interface/s3.service.interface";
import { v4 as uuid } from "uuid";
import { S3Service } from "../../shared/services/s3.service";
import { TYPES } from "../../shared/types/inversify.types";
import { IUserRepository } from "../../repositories/interface/user.repository.interface";

@injectable()
export class FileService implements IFileService {
  private s3Service = new S3Service();
  @inject(TYPES.UserRepository)
  private readonly _userRepository!: IUserRepository;

  async upload(
    role: "user" | "trainer" | "admin" | "course",
    type: string,
    id: string,
    file: Express.Multer.File
  ): Promise<string> {
    const user = await this._userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.profileImage !== undefined && type === "profile") {
      await this.s3Service.deleteFile(user.profileImage);
    }
    if (user.resume !== undefined && type === "resume") {
      await this.s3Service.deleteFile(user.resume);
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
    await this.s3Service.uploadFile(key, file.buffer, file.mimetype);
    return key;
  }

  async getSignedUrl(
    userId: string,
    type: string | undefined
  ): Promise<string> {
    const user = await this._userRepository.findById(userId);
    if (!user || user.profileImage === undefined) {
      throw new Error("Profile image not found");
    }
    if (type === "profile") {
      return this.s3Service.getFileUrl(user.profileImage, 3600);
    } else if (type === "resumes") {
      const res = await this.s3Service.getFileDetails(user.resume!);
      const obj = JSON.parse(res);
      obj.url = await this.s3Service.getFileUrl(user.resume!, 3600);
      return JSON.stringify(obj);
    }
    return "";
  }

  async delete(key: string): Promise<void> {
    return this.s3Service.deleteFile(key);
  }
}
