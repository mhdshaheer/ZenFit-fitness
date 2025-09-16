export const TYPES = {
  AuthService: Symbol.for("authService"),
  AuthController: Symbol.for("authController"),

  AdminService: Symbol.for("adminService"),
  AdminController: Symbol.for("adminController"),

  FileController: Symbol.for("FileController"),
  FileService: Symbol.for("FileService"),

  ProfileController: Symbol.for("ProfileController"),
  ProfileService: Symbol.for("ProfileService"),

  ProgramController: Symbol.for("ProgramController"),
  ProgramService: Symbol.for("ProgramService"),

  SessionController: Symbol.for("SessionController"),
  SessionService: Symbol.for("SessionService"),

  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  TempUserRepository: Symbol.for("TempUserRepository"),
  SessionRepository: Symbol.for("SessionRepository"),
  ProgramRespository: Symbol.for("ProgramRepository"),
};
