import { Container } from "inversify";

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
import { TYPES } from "./shared/types/inversify.types";
import { ICategoryService } from "./services/interface/category.service.interface";
import { CategoryService } from "./services/implimentation/category.service";
import { ICategoryRepository } from "./repositories/interface/category.repository.interface";
import { CategoryRepository } from "./repositories/implimentation/category.repository";
import { ICategoryController } from "./controllers/interface/category.controller.interface";
import { CategoryController } from "./controllers/implimentation/category.controller";
import { IAuthService } from "./services/interface/auth.service.interface";
import { IAuthController } from "./controllers/interface/auth.controller.interface";
import { IAdminService } from "./services/interface/admin.service.interface";
import { IAdminController } from "./controllers/interface/admin.controller.interface";
import { IPaymentService } from "./services/interface/payment.service.interface";
import { PaymentService } from "./services/implimentation/payment.service";
import { IPaymentController } from "./controllers/interface/payment.controller.interface";
import { PaymentController } from "./controllers/implimentation/payment.controller";
import { IPaymentRepository } from "./repositories/interface/payment.repostitory.interface";
import { PaymentRepository } from "./repositories/implimentation/payment.repository";
import { ISlotRepository } from "./repositories/interface/slot.repository.interface";
import { SlotRepository } from "./repositories/implimentation/slot.repository";
import { ISlotService } from "./services/interface/slot.service.interface";
import { SlotService } from "./services/implimentation/slot.service";
import { ISlotController } from "./controllers/interface/slot.controller.interface";
import { SlotController } from "./controllers/implimentation/slot.controller";

const container = new Container();

// Auth
container.bind<IAuthService>(TYPES.AuthService).to(AuthService);
container.bind<IAuthController>(TYPES.AuthController).to(AuthController);

// Admin
container.bind<IAdminService>(TYPES.AdminService).to(AdminService);
container.bind<IAdminController>(TYPES.AdminController).to(AdminController);

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

// Category
container.bind<ICategoryService>(TYPES.CategoryService).to(CategoryService);
container
  .bind<ICategoryController>(TYPES.CategoryController)
  .to(CategoryController);

// Payment
container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService);
container
  .bind<IPaymentController>(TYPES.PaymentController)
  .to(PaymentController);

// Slot
container.bind<ISlotService>(TYPES.SlotService).to(SlotService);
container.bind<ISlotController>(TYPES.SlotController).to(SlotController);

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
container
  .bind<ICategoryRepository>(TYPES.CategoryRepository)
  .to(CategoryRepository);
container
  .bind<IPaymentRepository>(TYPES.PaymentRepository)
  .to(PaymentRepository);
container.bind<ISlotRepository>(TYPES.SlotRepository).to(SlotRepository);
export { container };
