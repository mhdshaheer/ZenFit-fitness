import { HttpResponse } from "../../const/response_message.const";
import { IUser } from "../../interfaces/user.interface";
import { AuthRepository } from "../../repositories/implimentation/auth.repository";
import { TempUserRepository } from "../../repositories/implimentation/tempUser.repository";
import { comparePassword, hashedPassword } from "../../utils/hash.util";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
} from "../../utils/jwt.util";
import { sendOtpMail } from "../../utils/mail.util";
import { generateOtp } from "../../utils/otp";
import { IAuthService } from "../interface/auth.service.interface";
import { Request, Response } from "express";
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
    const isHashed = password.startsWith("$2b$");
    const finalPassword = isHashed ? password : await hashedPassword(password);

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
      console.log("otp not matching...");
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

    // Set refreshToken as HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // ✅ false in development
      sameSite: "lax", // or 'strict' if you prefer
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      console.log("tmp user not found");
      res.status(404).json({ error: "No signup request found for this email" });
      return;
    }
    const newOtp = generateOtp();
    temp.otp = newOtp;

    await this.tempRepository.updateOtp(email, newOtp);
    try {
      await sendOtpMail(email, newOtp);
      console.log("Resend otp is :", newOtp);
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

    const match = await comparePassword(password, user.password);
    if (!match) throw new Error("Invalid credentials");
    if (user.role == "admin") {
      const token = generateToken({ id: user._id, role: "admin" });
      return { user, token };
    } else {
      const token = generateToken({ id: user._id, role: "user" });
      return { user, token };
    }
  }
  async getAllUsers(): Promise<IUser[]> {
    return await this.authRepository.findAll();
  }
  async blockUser(id: string): Promise<IUser | null> {
    const user = await this.authRepository.findById(id);
    if (!user) throw new Error("User not found");
    return await this.authRepository.updateStatus(id, "blocked");
  }

  async unblockUser(id: string): Promise<IUser | null> {
    const user = await this.authRepository.findById(id);
    if (!user) throw new Error("User not found");
    return await this.authRepository.updateStatus(id, "active");
  }
}
