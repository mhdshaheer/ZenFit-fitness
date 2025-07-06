import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";
import { AuthService } from "../../services/implimentation/auth.service";
// import { TrainerAuthService } from "../../services/implimentation/trainer-auth.service";
import { IAuthController } from "../interface/auth.controller.interface";
import { Request, Response } from "express";

export class AuthController implements IAuthController {
  // private trainerAuthService = new TrainerAuthService();
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
        message: HttpResponse.USER_CREATION_SUCCESS,
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

  async resendOtp(req: Request, res: Response): Promise<void> {
    await this.authService.resendOtp(req, res);
  }
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);

      let response = {
        message: HttpResponse.LOGIN_SUCCESS,
        trainer: {
          id: user._id,
          name: user.username,
          email: user.email,
        },
        token,
        role: user.role,
      };

      res.status(HttpStatus.OK).json(response);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  }
  // public async signupTrainer(req: Request, res: Response): Promise<void> {
  //   try {
  //     console.log("request from frontend", req.body);
  //     const { name, email, password, experience, languages, role } = req.body;
  //     const user = await this.trainerAuthService.signup({
  //       name,
  //       email,
  //       password,
  //       experience,
  //       languages,
  //       role,
  //     });
  //     res.status(201).json({
  //       message: "Trainer registered successfully",
  //       user,
  //     });
  //   } catch (error: any) {
  //     const message = error.message || "Server error";

  //     let status = HttpStatus.INTERNAL_SERVER_ERROR;

  //     if (message === "Email already exists") {
  //       status = HttpStatus.CONFLICT;
  //     } else if (message === "All fields are required") {
  //       status = HttpStatus.BAD_REQUEST;
  //     }

  //     res.status(status).json({ error: message });
  //   }
  // }
}
