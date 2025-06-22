import { IUser } from "../../interfaces/user.interface";
import { AuthRepository } from "../../repositories/implimentation/auth.repository";
import { TempUserRepository } from "../../repositories/implimentation/tempUser.repository";
import { hashedPassword } from "../../utils/hash.util";
import { sendOtpMail } from "../../utils/mail.util";
import { generateOtp } from "../../utils/otp";
import { IAuthService } from "../interface/auth.service.interface";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
export class AuthService implements IAuthService {
  private tempRepository = new TempUserRepository();
  private authRepository = new AuthRepository();

  async signup(userData: IUser): Promise<IUser> {
    const { username, email, password, dob, gender, role } = userData;
    if (!username || !email || !password || !dob || !gender) {
      throw new Error("All fields are required");
    }
    const existing = await this.authRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already exists");
    }
    // If password is already hashed, skip
    const isHashed = password.startsWith("$2b$");
    const finalPassword = isHashed ? password : await hashedPassword(password);

    return await this.authRepository.createUser({
      username,
      email,
      password: finalPassword,
      dob,
      gender,
      role,
    });
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    const { username, email, password, dob, gender } = req.body.formData;
    console.log("data from the frontend: ", req.body);
    if (!username || !email || !password || !dob || !gender) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const otp = generateOtp();
    console.log("otp is :", otp);
    const hashPassword = await hashedPassword(password);

    const userPayload = {
      username,
      email,
      password: hashPassword,
      dob,
      gender,
      otp,
      createdAt: Date.now(),
    };
    await this.tempRepository.saveTempUser(email, otp, userPayload);

    // TODO: Send OTP to email (you can integrate NodeMailer later)

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

    const temp = await this.tempRepository.findByEmail(email);
    if (!temp) {
      res.status(400).json({ error: "OTP expired or not found" });
      return;
    }
    console.log(temp.otp, otp);
    if (temp.otp !== otp) {
      res.status(401).json({ error: "Invalid OTP" });
      return;
    }

    // At this point payload is your IUser
    const payload = temp.payload as IUser;

    console.log("Payload before signup:", payload);

    const { username, password, dob, gender } = payload;

    if (!username || !email || !password || !dob || !gender) {
      res.status(400).json({ error: "Incomplete user data" });
      return;
    }

    // Use signup() to create user with ensured role
    const createdUser = await this.signup({
      ...payload,
      role: "user", // force assign role if missing
    });

    // clean up
    await this.tempRepository.deleteByEmail(email);

    res.status(201).json({
      message: "User created successfully",
      user: createdUser,
    });
  }
}
