import { inject, injectable } from "inversify";
import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";
import { IUser } from "../../interfaces/user.interface";
import { comparePassword, hashedPassword } from "../../shared/utils/hash.util";
import logger from "../../shared/services/logger";
import { generateOtp } from "../../shared/utils/otp.util";
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
import { sendOtpMail } from "../../shared/services/mail.util";
@injectable()
export class AuthService implements IAuthService {
  // DI injection
  @inject(TYPES.UserRepository)
  private userRepository!: IUserRepository;
  @inject(TYPES.TempUserRepository)
  private tempRepository!: ITempUserRepository;
  // ======================================

  async signup(userData: IUser): Promise<IUser> {
    const { username, email, password, dob, role } = userData;
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error(HttpResponse.USER_EXIST);
    }
    // If password is already hashed, skip
    const isHashed = password!.startsWith("$2b$");
    const finalPassword = isHashed ? password : await hashedPassword(password!);

    return await this.userRepository.createUser({
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
    console.log("Otp is [console] : ", otp);
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
    await this.tempRepository.saveTempUser(email, otp, userPayload);

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
    const temp = await this.tempRepository.findByEmail(email);
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
    const { username, password, role } = payload;

    if (!username || !email || !password || !role) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: HttpResponse.USER_DATA_INCOMPLETE });
      return;
    }

    // 4. Register user
    const createdUser = await this.signup({ ...payload });

    // 5. Clean up temporary storage
    await this.tempRepository.deleteByEmail(email);

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

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes (adjust as needed)
      path: "/",
    });

    // Set refreshToken as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // ✅ false in development
      sameSite: "lax", // or 'strict' if you prefer
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    res.status(HttpStatus.OK).json({
      message: "OTP verified and user registered",
      accessToken,
      email,
      role,
    });
    return;
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const temp = await this.tempRepository.findByEmail(email);
    if (!temp) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ error: "No signup request found for this email" });
      return;
    }
    const newOtp = generateOtp();
    temp.otp = newOtp;

    await this.tempRepository.updateOtp(email, newOtp);
    try {
      await sendOtpMail(email, newOtp);
      console.log("resent otp [console.log:] : ", newOtp);
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

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
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
  async sendForgotPasswordOtp(email: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      const error: any = new Error(HttpResponse.USER_NOT_FOUND);
      error.statusCode = HttpStatus.NOT_FOUND;
      throw error;
    }

    const otp = generateOtp();
    console.log("forgot password otp is[console] : ", otp);
    logger.info(`forgot password otp is : ${otp}`);
    await this.tempRepository.saveTempUser(email, otp, {});

    try {
      await sendOtpMail(email, otp);
      return { message: HttpResponse.OTP_SUCCESS };
    } catch (err) {
      logger.error("Failed to send OTP mail:", err);
      const error: any = new Error(HttpResponse.OTP_FAILED);
      error.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  async verifyForgotOtp(email: string, otp: string) {
    const temp = await this.tempRepository.findByEmail(email);

    if (!temp || temp.otp !== otp) {
      const error: any = new Error(HttpResponse.OTP_EXPIRED);
      error.statusCode = HttpStatus.UNAUTHORIZED;
      throw error;
    }
    console.log("on verify forgot otp service");
    return { message: HttpResponse.OTP_VERIFIED_SUCCESS };
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, newPassword } = req.body;
    const temp = await this.tempRepository.findByEmail(email);

    if (!temp) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: HttpResponse.RESET_PASSWORD_FAILED });
      return;
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: HttpResponse.USER_NOT_FOUND });
      return;
    }

    const hashedNewPassword = await hashedPassword(newPassword);
    const updatedUser = await this.userRepository.updatePassword(
      email,
      hashedNewPassword
    );

    if (!updatedUser) {
      console.log("error in updated user on forgot password");
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: HttpResponse.RESET_PASSWORD_FAILED });
      return;
    }
    await this.tempRepository.deleteByEmail(email);

    res
      .status(HttpStatus.OK)
      .json({ message: HttpResponse.RESET_PASSWORD_SUCCESS });

    return;
  }

  async handleGoogleLogin(profile: any): Promise<IUser> {
    let user = await this.userRepository.findByGoogleId(profile.id);
    if (!user) {
      user = await this.userRepository.createGoogleUser({
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
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    return;
  }

  async handleRefreshToken(
    refreshToken: string | undefined,
    res: Response
  ): Promise<void> {
    if (!refreshToken) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: HttpResponse.REFRESH_TOKEN_EXPIRED });
      return;
    }
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const payload = {
        id: decoded?.id || null,
        role: decoded?.role || null,
      };
      const accessToken = generateAccessToken(payload);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 15 * 60 * 1000,
        path: "/",
      });
      res.json({ message: HttpResponse.ACCESS_TOKEN_REFRESHED });
      return;
    } catch (error) {
      console.log("Error :", error);
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: HttpResponse.REFRESH_TOKEN_INVALID });
      return;
    }
  }
}
