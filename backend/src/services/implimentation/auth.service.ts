import { injectable } from "inversify";
import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";
import { IUser } from "../../interfaces/user.interface";
import { AuthRepository } from "../../repositories/implimentation/auth.repository";
import { TempUserRepository } from "../../repositories/implimentation/tempUser.repository";
import { googleClient } from "../../utils/google-client";
import { comparePassword, hashedPassword } from "../../utils/hash.util";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  verifyRefreshToken,
} from "../../utils/jwt.util";
import logger from "../../utils/logger";
import { sendOtpMail } from "../../utils/mail.util";
import { generateOtp } from "../../utils/otp";
import { IAuthService } from "../interface/auth.service.interface";
import { Request, Response } from "express";
@injectable()
export class AuthService implements IAuthService {
  private tempRepository = new TempUserRepository();
  private authRepository = new AuthRepository();

  async signup(userData: IUser): Promise<IUser> {
    const { username, email, password, dob, role } = userData;
    const existing = await this.authRepository.findByEmail(email);
    if (existing) {
      throw new Error(HttpResponse.USER_EXIST);
    }
    // If password is already hashed, skip
    const isHashed = password!.startsWith("$2b$");
    const finalPassword = isHashed ? password : await hashedPassword(password!);

    return await this.authRepository.createUser({
      username,
      email,
      password: finalPassword,
      dob,
      role,
    });
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    console.log("data from the frontend: ", req.body);
    const { username, email, password, role } = req.body;

    const otp = generateOtp();
    console.log("otp is :", otp);
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
      res.status(200).json({ message: "OTP sent successfully to email" });
    } catch (err) {
      console.error("Mail send error:", err);
      res.status(500).json({ error: "Failed to send OTP email" });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    // 1. Check if temp user exists
    const temp = await this.tempRepository.findByEmail(email);
    if (!temp) {
      res.status(400).json({ error: "OTP expired or not found" });
      return;
    }

    // 2. Validate OTP
    if (temp.otp !== otp) {
      logger.info("otp not matching...");
      res.status(401).json({ error: "Invalid OTP" });
      return;
    }

    // 3. Extract and validate payload
    const payload = temp.payload as IUser;
    const { username, password, role } = payload;

    if (!username || !email || !password || !role) {
      res.status(400).json({ error: "Incomplete user data" });
      return;
    }

    // 4. Register user
    const createdUser = await this.signup({ ...payload });

    // 5. Clean up temporary storage
    await this.tempRepository.deleteByEmail(email);

    if (!createdUser._id) {
      res.status(500).json({ error: "User ID not found after registration" });
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

    res.status(200).json({
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
      res.status(404).json({ error: "No signup request found for this email" });
      return;
    }
    const newOtp = generateOtp();
    temp.otp = newOtp;

    await this.tempRepository.updateOtp(email, newOtp);
    try {
      await sendOtpMail(email, newOtp);
      logger.info("Resend otp is :", newOtp);
      res.status(200).json({ message: "OTP resent successfully" });
      return;
    } catch (error) {
      console.error("Resend OTP error:", error);
      res.status(500).json({ error: "Failed to resend OTP email" });
      return;
    }
  }

  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await comparePassword(password, user.password!);
    if (!isMatch) throw new Error("Invalid credentials");

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

  // ================================================
  async sendForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const otp = generateOtp();
    logger.info("forgot password otp is : ", otp);
    await this.tempRepository.saveTempUser(email, otp, {});

    try {
      await sendOtpMail(email, otp);
      res.status(200).json({ message: "OTP sent to email for password reset" });
      return;
    } catch (err) {
      logger.error("Failed to send OTP mail:", err);
      res.status(500).json({ message: "Failed to send OTP email" });
      return;
    }
  }

  async verifyForgotOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;
    const temp = await this.tempRepository.findByEmail(email);

    if (!temp || temp.otp !== otp) {
      res.status(401).json({ message: "Invalid or expired OTP" });
      return;
    }

    res.status(200).json({ message: "OTP verified successfully" });
    return;
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { email, newPassword } = req.body;
    const temp = await this.tempRepository.findByEmail(email);

    if (!temp) {
      res
        .status(400)
        .json({ message: "Reset password request not found or expired" });
      return;
    }

    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const hashedNewPassword = await hashedPassword(newPassword);
    await this.authRepository.updatePassword(email, hashedNewPassword);
    await this.tempRepository.deleteByEmail(email);

    res.status(200).json({ message: "Password reset successful" });
  }

  async handleGoogleLogin(profile: any) {
    let user = await this.authRepository.findByGoogleId(profile.id);
    if (!user) {
      user = await this.authRepository.createGoogleUser({
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
        .json({ message: "Refresh token not found or expired" });
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
      res.json({ message: "Access token refreshed" });
      return;
    } catch (error) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ message: "Invalid refresh token" });
      return;
    }
  }
}
