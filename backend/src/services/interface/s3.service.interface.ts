export interface IFileService {
  upload(
    role: "user" | "trainer" | "admin" | "course",
    type: string,
    id: string,
    file: Express.Multer.File
  ): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}
