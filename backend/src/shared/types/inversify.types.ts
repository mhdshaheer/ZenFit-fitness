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

  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  TempUserRepository: Symbol.for("TempUserRepository"),
  SessionRepository: Symbol.for("SessionRepository"),
  ProgramRespository: Symbol.for("ProgramRepository"),
  CategoryRepository: Symbol.for("CategoryRepository"),
};
