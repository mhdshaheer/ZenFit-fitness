import { ITrainer } from "../../interfaces/trainer.interface";
import { TempTrainerRepository } from "../../repositories/implimentation/tempTrainer.repository";
import { TrainerAuthRepository } from "../../repositories/implimentation/trainer-auth.repository";
import { hashedPassword } from "../../utils/hash.util";
import { sendOtpMail } from "../../utils/mail.util";
import { generateOtp } from "../../utils/otp";
import { Request, Response } from "express";
import { ITrainerAuthService } from "../interface/trainer-auth.service.interface";
export class TrainerAuthService implements ITrainerAuthService {
  private tempTrainerRepository = new TempTrainerRepository();
  private trainerAuthRepository = new TrainerAuthRepository();

  async signup(userData: ITrainer): Promise<ITrainer> {
    const { name, email, password, experience, languages, role } = userData;
    if (!name || !email || !password || !experience || !languages.length) {
      throw new Error("All fields are required");
    }
    const existing = await this.trainerAuthRepository.findByEmail(email);
    if (existing) {
      throw new Error("Email already exists");
    }
    // If password is already hashed, skip
    const isHashed = password.startsWith("$2b$");
    const finalPassword = isHashed ? password : await hashedPassword(password);

    return await this.trainerAuthRepository.createTrainer({
      name,
      email,
      password: finalPassword,
      languages,
      experience,
      role,
    });
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    console.log("data from the frontend: ", req.body);
    console.log("name :  ", req.body.name);
    const { name, email, password, experience, languages } = req.body;
    if (!name || !email || !password || !languages.length || !experience) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const otp = generateOtp();
    console.log("otp is :", otp);
    const hashPassword = await hashedPassword(password);

    const userPayload = {
      name,
      email,
      password: hashPassword,
      experience,
      languages,
      otp,
      createdAt: Date.now(),
    };
    await this.tempTrainerRepository.saveTempTrainer(email, otp, userPayload);

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

    const temp = await this.tempTrainerRepository.findByEmail(email);
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
    const payload = temp.payload as ITrainer;

    console.log("Payload before signup:", payload);

    const { name, password, languages, experience } = payload;

    if (!name || !email || !password || !experience || !languages.length) {
      res.status(400).json({ error: "Incomplete trainer data" });
      return;
    }

    // Use signup() to create user with ensured role
    const createdUser = await this.signup({
      ...payload,
      role: "trainer", // force assign role if missing
    });

    // clean up
    await this.tempTrainerRepository.deleteByEmail(email);

    res.status(201).json({
      message: "Trainer created successfully",
      user: createdUser,
    });
  }
}
