export enum HttpResponse {
  // Common
  SERVER_ERROR = "Internal server error",
  PAGE_NOT_FOUND = "Route not found",
  UNAUTHORIZED = "Unauthorized access!",
  ACCESS_DENIED = "Access denied: User account is blocked",
  TOO_MANY_LOGIN_ATTEMPTS = "Too many login attempts, please try again later",

  UNEXPECTED_KEY_FOUND = "Unexpected key found",
  PROFILE_PICTURE_CHANGED = "Profile picture changed successfully",
  INVALID_ID = "Invalid ID format",

  // Authentication
  INVALID_CREDENTIALS = "Invalid credentials",

  USER_CREATION_FAILED = "User creation failed",
  USER_CREATION_SUCCESS = "User created successfully",

  NO_PAYLOAD = "Payload not found",
  USERNAME_EXIST = "Username Already Exist",
  USER_EXIST = "User already exist",
  USER_NOT_FOUND = "User not found",
  USERNAME_CHANGED = "Username has been changed successfully",
  SAME_USERNAME = "Cannot change to old username",
  USER_DATA_INCOMPLETE = "Incomplete user data",
  USER_FETCH_FAILED = "Failed to fetch users",
  INVALID_USER_STATUS = "Status must be either active or blocked",
  LOGIN_SUCCESS = "Login successful",
  GOOGLE_LOGIN_SUCCESS = "Logged in with Google successfully",
  GOOGLE_AUTH_FAILED = "Google authentication failed",
  LOGOUT_SUCCESS = "Logged out successfully",

  // Form
  FIELDS_REQUIRED = "All fields are required",
  INVALID_EMAIL_PASSWORD = "Invalid email or password",
  EMAIL_OTP_REQUIRED = "Email and OTP are required",

  // Password
  PASSWORD_INCORRECT = "Incorrect password, try again",
  PASSWORD_CHANGE_SUCCESS = "Password changed successfully!",
  RESET_PASSWORD_FAILED = "Reset password request not found or expired",
  RESET_PASSWORD_SUCCESS = "Password reset successful",

  // Email
  EMAIL_EXIST = "Email already exist",
  INVALID_EMAIL = "Invalid email address",
  EMAIL_REQUIRED = "Email is required",
  // OTP
  OTP_INCORRECT = "Incorrect otp, try again",
  OTP_NOT_FOUND = "Otp not found",
  OTP_INVALID = "Invalid OTP",
  OTP_SUCCESS = "OTP sent successfully to email",
  OTP_FAILED = "Failed to send OTP email",
  OTP_RESENT_SUCCESS = "OTP resent successfully",
  OTP_RESENT_FAILED = "OTP resent Failed",
  OTP_EXPIRED = "Expired OTP",
  OTP_VERIFIED_SUCCESS = "OTP verified successfully",

  REGISTRATION_SUCCESS = "User registered successfully",
  REGISTRAITION_REQUEST_NOT_FOUND = "Registration request not found",

  // Token
  NO_TOKEN = "Access Denied: No token provided",
  TOKEN_EXPIRED = "Invalid or expired token",
  REFRESH_TOKEN_EXPIRED = "Refresh token not found or expired",
  ACCESS_TOKEN_REFRESHED = "Access token refreshed",
  REFRESH_TOKEN_INVALID = "Invalid refresh token",

  // Categories
  CATEGORY_NAME_REQUIRED = "Category name is required",
  CATEGORY_FETCH_FAILED = "Failed to fetch categories",
  CATEGOTY_CREATION_FAILED = "Error in category creation.",
  CATEGORY_NOTFOUND = "Category not found",
  CATEGORY_UPDATION_FAILED = "Category updation failed",

  // Programs
  PROGRAM_ID_MISSING = "Program ID is missing",
  PROGRAM_DATA_REQUIRED = "Program data is required",
  PROGRAM_SAVED_SUCCESSFULLY = "Program is saved successfully",
  PROGRAM_SAVED_FAILED = "Failed to save program",
  PROGRAM_NOT_FOUND = "Program not found",
  PROGRAM_UPDATE_SUCCESS = "Program updation failed",
  PROGRAM_UPDATE_FAILED = "Program updated successfully",

  // File
  FILE_NOT_FOUND = "No file uploaded",
  FILE_DELETE_SUCCESS = "File Deleted successfully",

  // Session
  SESSION_DATA_REQUIRED = "Session data is required",
  SESSION_SAVE_FAILED = "Failed to save session",
  SESSION_SAVE_SUCCESS = "session is saved successfully",
  SESSION_NOT_FOUND = "Session not found",

  // Notifications
  NOTIFICATION_NOT_FOUND = "Notification not found",
  INVALID_NOTIFICATION_IDS = "Invalid notification IDs provided",
  NOTIFICATIONS_MARKED_AS_READ = "All notifications marked as read",

  // Payments
  TRANSACTION_HISTORY_FETCH_FAILED = "Failed to fetch transaction history",
}
