import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client, { S3_BUCKET } from "../../config/s3.config";
import { IS3Repository } from "../interface/s3.repository.interface";

export class S3Repository implements IS3Repository {
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );
    return key;
  }

  async getFileUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  }

  async deleteFile(key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      })
    );
  }
  async getFileDetails(key: string) {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    const response = await s3Client.send(command);
    const details = JSON.stringify({
      name: key.split("/").pop(),
      size: response.ContentLength,
      type: response.ContentType,
      uploadedAt: response.LastModified,
    });
    return details;
  }
}
