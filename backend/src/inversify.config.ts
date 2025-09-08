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
import { ProfileController } from "./controllers/implimentation/profile.controller";
import { IProfileService } from "./services/interface/profile.service.interface";
import { ProfileService } from "./services/implimentation/profile.service";
import { IProgramService } from "./services/interface/program.service.interface";
import { ProgramService } from "./services/implimentation/program.service";
import { IProgramController } from "./controllers/interface/program.controller.interface";
import { ProgramController } from "./controllers/implimentation/program.controller";

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
container.bind<IProfileService>(TYPES.ProfileService).to(ProfileService);
container
  .bind<IProfileController>(TYPES.ProfileController)
  .to(ProfileController);

// Program
container.bind<IProgramService>(TYPES.ProgramService).to(ProgramService);
container
  .bind<IProgramController>(TYPES.ProgramController)
  .to(ProgramController);

export { container };
