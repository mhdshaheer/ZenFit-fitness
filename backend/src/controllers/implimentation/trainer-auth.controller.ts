import { HttpStatus } from "../../const/statuscode.const";
import { TrainerAuthService } from "../../services/implimentation/trainer-auth.service";
import { IAuthController } from "../interface/auth.controller.interface";
import { Request, Response } from "express";

export class TrainerAuthController implements IAuthController {
  private trainerAuthService = new TrainerAuthService();
  public async signup(req: Request, res: Response): Promise<void> {
    try {
      console.log("request from frontend", req.body);
      const { name, email, password, experience, languages, role } = req.body;
      const user = await this.trainerAuthService.signup({
        name,
        email,
        password,
        experience,
        languages,
        role,
      });
      res.status(201).json({
        message: "Trainer registered successfully",
        user,
      });
    } catch (error: any) {
      const message = error.message || "Server error";

      let status = HttpStatus.INTERNAL_SERVER_ERROR;

      if (message === "Email already exists") {
        status = HttpStatus.CONFLICT;
      } else if (message === "All fields are required") {
        status = HttpStatus.BAD_REQUEST;
      }

      res.status(status).json({ error: message });
    }
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    await this.trainerAuthService.sendOtp(req, res);
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    await this.trainerAuthService.verifyOtp(req, res);
  }
}
