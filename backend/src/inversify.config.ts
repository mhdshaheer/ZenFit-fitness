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
import { IUserRepository } from "./repositories/interface/user.repository.interface";
import { UserRepository } from "./repositories/implimentation/user.repository";
import { ITempUserRepository } from "./repositories/interface/tempUser.repository.interface";
import { TempUserRepository } from "./repositories/implimentation/tempUser.repository";
import { IProgramRepository } from "./repositories/interface/program.repository.interface";
import { ProgramRepositoy } from "./repositories/implimentation/program.repository";
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
import { ISlotTemplateRepository } from "./repositories/interface/slotTemplate.repository.interface";
import { SlotTemplateRepository } from "./repositories/implimentation/slotTemplate.repository";
import { ISlotInstanceRepository } from "./repositories/interface/slotInstance.repository.interface";
import { SlotInstanceRepository } from "./repositories/implimentation/slotInstance.repository";
import { ISlotTemplateService } from "./services/interface/slotTemplate.service.interface";
import { SlotTemplateService } from "./services/implimentation/slotTemplate.service";
import { ISlotInstanceService } from "./services/interface/slotInstance.service.interface";
import { SlotInstanceService } from "./services/implimentation/slotInstance.service";
import { IBookingRepository } from "./repositories/interface/booking.repository.interface";
import { BookingRepository } from "./repositories/implimentation/booking.repository";
import { IBookingService } from "./services/interface/booking.service.interface";
import { BookingService } from "./services/implimentation/booking.service";
import { IBookingController } from "./controllers/interface/booking.controller.interface";
import { BookingController } from "./controllers/implimentation/booking.controller";
import { INotificationRepository } from "./repositories/interface/notification.repository.interface";
import { NotificationRepository } from "./repositories/implimentation/notification.repository";
import { INotificationService } from "./services/interface/notification.service.interface";
import { NotificationService } from "./services/implimentation/notification.service";
import { INotificationController } from "./controllers/interface/notification.controller.interface";
import { NotificationController } from "./controllers/implimentation/notification.controller";
import { IChatService } from "./services/interface/chat.service.interface";
import { IChatController } from "./controllers/interface/chat.controller.interface";
import { ChatService } from "./services/implimentation/chat.service";
import { ChatController } from "./controllers/implimentation/chat.controller";
import { IChatRepository } from "./repositories/interface/chat.repository.interface";
import { ChatRepository } from "./repositories/implimentation/chat.repository";
import { IFeedbackService } from "./services/interface/feedback.service.interface";
import { FeedbackService } from "./services/implimentation/feedback.service";
import { IFeedbackController } from "./controllers/interface/feedback.controller.interface";
import { FeedbackController } from "./controllers/implimentation/feedback.controller";
import { IFeedbackRepository } from "./repositories/interface/feedback.repository.interface";
import { FeedbackRepository } from "./repositories/implimentation/feedback.repository";
import { ISlotTemplateController } from "./controllers/interface/slotTemplate.controller.interface";
import { SlotTemplateController } from "./controllers/implimentation/slotTemplate.controller";
import { ISlotInstanceController } from "./controllers/interface/slotInstance.controller.interface";
import { SlotInstanceController } from "./controllers/implimentation/slotInstance.controller";

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
container
  .bind<ISlotTemplateController>(TYPES.SlotTemplateController)
  .to(SlotTemplateController);
container
  .bind<ISlotInstanceController>(TYPES.SlotInstanceController)
  .to(SlotInstanceController);
container
  .bind<ISlotTemplateService>(TYPES.SlotTemplateService)
  .to(SlotTemplateService);
container
  .bind<ISlotInstanceService>(TYPES.SlotInstanceService)
  .to(SlotInstanceService);

// Booking
container.bind<IBookingService>(TYPES.BookingService).to(BookingService);
container
  .bind<IBookingController>(TYPES.BookingController)
  .to(BookingController);

// Notification
container
  .bind<INotificationService>(TYPES.NotificationService)
  .to(NotificationService);
container
  .bind<INotificationController>(TYPES.NotificationController)
  .to(NotificationController);

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository);
container
  .bind<ITempUserRepository>(TYPES.TempUserRepository)
  .to(TempUserRepository);
container
  .bind<IProgramRepository>(TYPES.ProgramRespository)
  .to(ProgramRepositoy);

container
  .bind<ICategoryRepository>(TYPES.CategoryRepository)
  .to(CategoryRepository);
container
  .bind<IPaymentRepository>(TYPES.PaymentRepository)
  .to(PaymentRepository);
container
  .bind<ISlotTemplateRepository>(TYPES.SlotTemplateRepository)
  .to(SlotTemplateRepository);
container
  .bind<ISlotInstanceRepository>(TYPES.SlotInstanceRepository)
  .to(SlotInstanceRepository);
container
  .bind<IBookingRepository>(TYPES.BookingRepository)
  .to(BookingRepository);
container
  .bind<INotificationRepository>(TYPES.NotificationRepository)
  .to(NotificationRepository);
container.bind<IChatRepository>(TYPES.ChatRepository).to(ChatRepository);


// Chat (after repositories are bound)
container.bind<IChatService>(TYPES.ChatService).to(ChatService);
container.bind<IChatController>(TYPES.ChatController).to(ChatController);

// Feedback
container.bind<IFeedbackRepository>(TYPES.FeedbackRepository).to(FeedbackRepository);
container.bind<IFeedbackService>(TYPES.FeedbackService).to(FeedbackService);
container.bind<IFeedbackController>(TYPES.FeedbackController).to(FeedbackController);

export { container };
