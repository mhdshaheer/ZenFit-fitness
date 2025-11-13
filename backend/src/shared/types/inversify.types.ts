export const TYPES = {
  // Auth
  AuthService: Symbol.for("authService"),
  AuthController: Symbol.for("authController"),

  // Admin
  AdminService: Symbol.for("adminService"),
  AdminController: Symbol.for("adminController"),

  // File
  FileController: Symbol.for("FileController"),
  FileService: Symbol.for("FileService"),

  // Profile
  ProfileController: Symbol.for("ProfileController"),
  ProfileService: Symbol.for("ProfileService"),

  // Program
  ProgramController: Symbol.for("ProgramController"),
  ProgramService: Symbol.for("ProgramService"),

  // Session
  SessionController: Symbol.for("SessionController"),
  SessionService: Symbol.for("SessionService"),

  // Category
  CategoryService: Symbol.for("CategoryService"),
  CategoryController: Symbol.for("CategoryController"),

  // Payment
  PaymentService: Symbol.for("PaymentService"),
  PaymentController: Symbol.for("PaymentController"),

  // Slot
  SlotService: Symbol.for("SlotService"),
  SlotController: Symbol.for("SlotController"),

  // Booking
  BookingService: Symbol.for("BookingService"),
  BookingController: Symbol.for("BookingController"),

  // Notification
  NotificationService: Symbol.for("NotificationService"),
  NotificationController: Symbol.for("NotificationController"),

  // Chat
  ChatService: Symbol.for("ChatService"),
  ChatController: Symbol.for("ChatController"),

  // Feedback
  FeedbackService: Symbol.for("FeedbackService"),
  FeedbackController: Symbol.for("FeedbackController"),

  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  TempUserRepository: Symbol.for("TempUserRepository"),
  SessionRepository: Symbol.for("SessionRepository"),
  ProgramRespository: Symbol.for("ProgramRepository"),
  CategoryRepository: Symbol.for("CategoryRepository"),
  PaymentRepository: Symbol.for("PaymentRepository"),
  SlotRepository: Symbol.for("SlotRepository"),
  BookingRepository: Symbol.for("BookingRepository"),
  NotificationRepository: Symbol.for("NotificationRepository"),
  ChatRepository: Symbol.for("ChatRepository"),
  FeedbackRepository: Symbol.for("FeedbackRepository"),
};
