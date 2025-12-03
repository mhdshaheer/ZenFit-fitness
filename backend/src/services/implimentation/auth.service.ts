import { inject, injectable } from "inversify";
import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";
import { IUser } from "../../interfaces/user.interface";
import { comparePassword, hashedPassword } from "../../shared/utils/hash.util";
import logger from "../../shared/services/logger.service";
import { generateOtp } from "../../shared/utils/otp.util";
import {
  setAuthCookies,
  clearAuthCookies,
  setAccessTokenCookie,
} from "../../shared/utils/cookie.util";
import { IAuthService } from "../interface/auth.service.interface";
import { Request, Response } from "express";
import { ITempUserRepository } from "../../repositories/interface/tempUser.repository.interface";
import { IUserRepository } from "../../repositories/interface/user.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt.util";
import { sendOtpMail } from "../../shared/services/mail.service";
import { AppError } from "../../shared/utils/appError.util";
import { INotificationService } from "../interface/notification.service.interface";
@injectable()
export class AuthService implements IAuthService {
  @inject(TYPES.UserRepository)
  private readonly _userRepository!: IUserRepository;
  @inject(TYPES.TempUserRepository)
  private readonly _tempRepository!: ITempUserRepository;
  @inject(TYPES.NotificationService)
  private readonly _notificationService!: INotificationService;
  // ======================================

  async signup(userData: IUser): Promise<IUser> {
    const { username, email, password, dob, role } = userData;
    const existing = await this._userRepository.findByEmail(email);
    if (existing) {
      throw new Error(HttpResponse.USER_EXIST);
    }
    // If password is already hashed, skip
    const isHashed = password!.startsWith("$2b$");
    const finalPassword = isHashed ? password : await hashedPassword(password!);

    return await this._userRepository.createUser({
      username,
      email,
      password: finalPassword,
      dob,
      role,
    });
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    const { username, email, password, role } = req.body;

    const otp = generateOtp();
    console.log("Otp is : ", otp);
    logger.info("otp is :", otp);
    const hashPassword = await hashedPassword(password);

    const userPayload = {
      username,
      email,
      password: hashPassword,
      role,
      otp,
      createdAt: Date.now(),
    };
    await this._tempRepository.saveTempUser(email, otp, userPayload);

    try {
      await sendOtpMail(email, otp);
      res.status(HttpStatus.OK).json({ message: HttpResponse.OTP_SUCCESS });
    } catch (err) {
      logger.error("Mail send error:", err);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: HttpResponse.OTP_FAILED });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    // 1. Check if temp user exists
    const temp = await this._tempRepository.findByEmail(email);
    if (!temp) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: HttpResponse.OTP_NOT_FOUND });
      return;
    }

    // 2. Validate OTP
    if (temp.otp !== otp) {
      logger.info("otp not matching...");
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ error: HttpResponse.OTP_INVALID });
      return;
    }

    // 3. Extract and validate payload
    const payload = temp.payload as IUser;
    const { role } = payload;

    if (!role) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: HttpResponse.USER_DATA_INCOMPLETE });
      return;
    }

    // 4. Register user
    const createdUser = await this.signup({ ...payload });
    await this._tempRepository.deleteByEmail(email);

    if (!createdUser._id) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: HttpResponse.USER_NOT_FOUND });
      return;
    }

    // 6. Generate tokens
    const accessToken = generateAccessToken({
      id: createdUser._id?.toString(),
      role,
    });
    const refreshToken = generateRefreshToken({
      id: createdUser._id.toString(),
      role,
    });

    setAuthCookies(res, accessToken, refreshToken);

    await this._notificationService.createNotification(
      createdUser._id.toString(),
      "user",
      "Welcome to ZenFit",
      "You're all set! Start exploring programs and sessions tailored for you."
    );

    const admins = await this._userRepository.getAllUsers();
    const adminUsers = admins.filter((user) => user.role === "admin");

    await Promise.all(
      adminUsers.map((admin) =>
        this._notificationService.createNotification(
          admin._id!.toString(),
          "admin",
          "New User Registration",
          `${createdUser.username ?? createdUser.email} has just joined ZenFit.`
        )
      )
    );

    res.status(HttpStatus.OK).json({
      message: HttpResponse.REGISTRATION_SUCCESS,
      accessToken,
      email,
      role,
    });
    return;
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const temp = await this._tempRepository.findByEmail(email);
    if (!temp) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: HttpResponse.REGISTRAITION_REQUEST_NOT_FOUND });
      return;
    }
    const newOtp = generateOtp();
    temp.otp = newOtp;

    await this._tempRepository.updateOtp(email, newOtp);
    try {
      await sendOtpMail(email, newOtp);
      console.log("resent otp : ", newOtp);
      logger.info("Resend otp is :", newOtp);
      res
        .status(HttpStatus.OK)
        .json({ message: HttpResponse.OTP_RESENT_SUCCESS });
      return;
    } catch (error) {
      logger.error("Resend OTP error:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: HttpResponse.OTP_RESENT_FAILED });
      return;
    }
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await comparePassword(password, user.password!);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }
    const accessToken = generateAccessToken({
      id: user._id!.toString(),
      role: user.role!,
    });
    const refreshToken = generateRefreshToken({
      id: user._id!.toString(),
      role: user.role!,
    });

    return { user, accessToken, refreshToken };
  }

  // ==================== FORGOT PASSWORD AND UPDATE ============================
  async sendForgotPasswordOtp(email: string): Promise<{ message: string }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new AppError(HttpResponse.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const otp = generateOtp();
    console.log("forgot password otp is[console] : ", otp);
    logger.info(`forgot password otp is : ${otp}`);
    await this._tempRepository.saveTempUser(email, otp, {});

    try {
      await sendOtpMail(email, otp);
      return { message: HttpResponse.OTP_SUCCESS };
    } catch (err) {
      logger.error("Failed to send OTP mail:", err);
      throw new AppError(
        HttpResponse.OTP_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyForgotOtp(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    const temp = await this._tempRepository.findByEmail(email);

    if (!temp || temp.otp !== otp) {
      throw new AppError(HttpResponse.OTP_EXPIRED, HttpStatus.UNAUTHORIZED);
    }
    return { message: HttpResponse.OTP_VERIFIED_SUCCESS };
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, newPassword } = req.body;
    const temp = await this._tempRepository.findByEmail(email);

    if (!temp) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: HttpResponse.RESET_PASSWORD_FAILED });
      return;
    }

    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: HttpResponse.USER_NOT_FOUND });
      return;
    }

    const hashedNewPassword = await hashedPassword(newPassword);
    const updatedUser = await this._userRepository.updatePassword(
      email,
      hashedNewPassword
    );

    if (!updatedUser) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: HttpResponse.RESET_PASSWORD_FAILED });
      return;
    }
    await this._tempRepository.deleteByEmail(email);

    res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.RESET_PASSWORD_SUCCESS });

    return;
  }

  async handleGoogleLogin(profile: any): Promise<IUser> {
    let user = await this._userRepository.findByGoogleId(profile.id);
    if (!user) {
      user = await this._userRepository.createGoogleUser({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.displayName,
        role: "user",
      });
    }
    return user;
  }
  // ================================================

  async logout(res: Response): Promise<void> {
    clearAuthCookies(res);
    return;
  }

  async handleRefreshToken(
    refreshToken: string | undefined,
    res: Response
  ): Promise<void> {
    if (
      refreshToken === undefined ||
      refreshToken === null ||
      refreshToken === ""
    ) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: HttpResponse.REFRESH_TOKEN_EXPIRED });
      return;
    }
    try {
      const decoded = verifyRefreshToken(refreshToken);

      if (decoded === null || decoded === undefined) {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: HttpResponse.REFRESH_TOKEN_INVALID });
        return;
      }
      const payload = {
        id: decoded.id ?? null,
        role: decoded.role ?? null,
      };
      const accessToken = generateAccessToken(payload);
      setAccessTokenCookie(res, accessToken);
      res.json({ message: HttpResponse.ACCESS_TOKEN_REFRESHED });
      return;
    } catch (error) {
      logger.error("Error :", error);
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: HttpResponse.REFRESH_TOKEN_INVALID });
      return;
    }
  }
}
