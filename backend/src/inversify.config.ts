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
import { ISessionService } from "./services/interface/session.service.interface";
import { SessionService } from "./services/implimentation/session.service";
import { ISessionController } from "./controllers/interface/session.controller.interface";
import { SessionController } from "./controllers/implimentation/session.controller";
import { IUserRepository } from "./repositories/interface/user.repository.interface";
import { UserRepository } from "./repositories/implimentation/user.repository";
import { ITempUserRepository } from "./repositories/interface/tempUser.repository.interface";
import { TempUserRepository } from "./repositories/implimentation/tempUser.repository";
import { IProgramRepository } from "./repositories/interface/program.repository.interface";
import { ProgramRepositoy } from "./repositories/implimentation/program.repository";
import { ISessionRepository } from "./repositories/interface/session.repository.interface";
import { SessionRepository } from "./repositories/implimentation/session.repository";

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

// Session
container.bind<ISessionService>(TYPES.SessionService).to(SessionService);
container
  .bind<ISessionController>(TYPES.SessionController)
  .to(SessionController);

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container
  .bind<ITempUserRepository>(TYPES.TempUserRepository)
  .to(TempUserRepository);
container
  .bind<IProgramRepository>(TYPES.ProgramRespository)
  .to(ProgramRepositoy);
container
  .bind<ISessionRepository>(TYPES.SessionRepository)
  .to(SessionRepository);

export { container };
