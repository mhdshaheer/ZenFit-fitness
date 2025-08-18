export interface IS3Repository {
  uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string>;
  getFileUrl(key: string, expiresIn?: number): Promise<string>;
  deleteFile(key: string): Promise<void>;
}
