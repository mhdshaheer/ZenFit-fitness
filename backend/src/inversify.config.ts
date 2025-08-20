import { Container } from "inversify";
import { TYPES } from "./types/inversify.types";

import { AdminController } from "./controllers/implimentation/admin.controller";
import { AdminService } from "./services/implimentation/admin.service";
import { AuthService } from "./services/implimentation/auth.service";
import { AuthController } from "./controllers/implimentation/auth.controller";
import { IFileService } from "./services/interface/s3.service.interface";
import { IFileController } from "./controllers/interface/s3.controller.interface";
import { FileService } from "./services/implimentation/s3.service";
import { FileController } from "./controllers/implimentation/s3.controller";
import { IProfileController } from "./controllers/interface/profile.controller.interface";

const container = new Container();

// Auth
container.bind<AuthService>(TYPES.AuthService).to(AuthService);
container.bind<AuthController>(TYPES.AuthController).to(AuthController);

// Admin
container.bind<AdminService>(TYPES.AdminService).to(AdminService);
container.bind<AdminController>(TYPES.AdminController).to(AdminController);

// S3 bucket
container.bind<IFileService>(TYPES.FileService).to(FileService);
container.bind<IFileController>(TYPES.FileController).to(FileController);

// profile
// container.bind<IProfileController>(Types.)
export { container };
