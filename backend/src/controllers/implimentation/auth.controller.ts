import { HttpStatus } from "../../const/statuscode.const";
import { AuthService } from "../../services/implimentation/auth.service";
import { IAuthController } from "../interface/auth.controller.interface";
import { Request, Response } from "express";

export class AuthController implements IAuthController {
  private authService = new AuthService();
  public async signup(req: Request, res: Response): Promise<void> {
    try {
      console.log("request from frontend", req.body);
      const { username, email, password, dob, gender, role } = req.body;
      const user = await this.authService.signup({
        username,
        email,
        password,
        dob,
        gender,
        role,
      });

      res.status(201).json({
        message: "User registered successfully",
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
    await this.authService.sendOtp(req, res);
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    await this.authService.verifyOtp(req, res);
  }
}
