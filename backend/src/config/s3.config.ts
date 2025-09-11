import { S3Client } from "@aws-sdk/client-s3";
import { env } from "./env.config";

const s3Client = new S3Client({
  region: env.aws_region!,
  credentials: {
    accessKeyId: env.aws_access_key_id!,
    secretAccessKey: env.aws_secret_access_key!,
  },
});

export const S3_BUCKET = process.env.AWS_S3_BUCKET!;

export default s3Client;
