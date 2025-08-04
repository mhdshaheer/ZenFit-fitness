export enum HttpResponse {
  // Common
  SERVER_ERROR = "Internal server error",
  PAGE_NOT_FOUND = "Route not found",
  UNAUTHORIZED = "Unauthorized access!",

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

  LOGIN_SUCCESS = "Login successful",
  GOOGLE_LOGIN_SUCCESS = "Logged in with Google successfully",
  LOGOUT_SUCCESS = "Logged out successfully",

  // Password
  PASSWORD_INCORRECT = "Incorrect password, try again",
  PASSWORD_CHANGE_SUCCESS = "Password changed successfully!",
  RESET_PASSWORD_FAILED = "Reset password request not found or expired",
  RESET_PASSWORD_SUCCESS = "Password reset successful",

  // Email
  EMAIL_EXIST = "Email already exist",
  INVALID_EMAIL = "Invalid email address",

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

  // Token
  NO_TOKEN = "Access Denied: No token provided",
  TOKEN_EXPIRED = "Invalid or expired token",
  REFRESH_TOKEN_EXPIRED = "Refresh token not found or expired",
  ACCESS_TOKEN_REFRESHED = "Access token refreshed",
  REFRESH_TOKEN_INVALID = "Invalid refresh token",
}
