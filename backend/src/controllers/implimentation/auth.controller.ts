import { inject, injectable } from "inversify";
import { env } from "../../config/env.config";
import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";

import { IAuthController } from "../interface/auth.controller.interface";
import { Request, Response } from "express";
import { TYPES } from "../../shared/types/inversify.types";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../shared/utils/jwt.util";
import { IAuthService } from "../../services/interface/auth.service.interface";

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(TYPES.AuthService) private authService: IAuthService) {}

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, dob, gender, role } = req.body;
      const user = await this.authService.signup({
        username,
        email,
        password,
        dob,
        gender,
        role,
      });
      res.status(HttpStatus.OK).json({
        message: HttpResponse.USER_CREATION_SUCCESS,
        user,
      });
    } catch (error) {
      if (error instanceof Error) {
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
      const { user, accessToken, refreshToken } = await this.authService.login(
        email,
        password
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
        path: "/",
      });

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax", // allow dev frontend access
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
      res.status(HttpStatus.OK).json({
        message: HttpResponse.LOGIN_SUCCESS,
        accessToken,
        role: user.role,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      if (err instanceof Error) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: err.message || "Login failed" });
      }
    }
  }
  async sendForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const result = await this.authService.sendForgotPasswordOtp(email);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: error.message || "Something went wrong",
        });
      }
    }
  }
  async verifyForgotOtp(req: Request, res: Response): Promise<void> {
    try {
      console.log("verify forgot otp message", req.body);
      const { email, otp } = req.body;
      const result = await this.authService.verifyForgotOtp(email, otp);
      console.log("result from service :", result);
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: error.message || "Something went wrong",
        });
      }
    }
  }
  async resetPassword(req: Request, res: Response): Promise<void> {
    await this.authService.resetPassword(req, res);
    return;
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    const user = req.user as any;
    console.log(user);
    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
      role: user.role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes (adjust as needed)
    });

    // Store refresh token on cookie:
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // ✅ false in dev
      sameSite: "lax", // allow dev frontend access
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(
      `${env.frontend_url}/user/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );

    return;
  }
  async logOut(_req: Request, res: Response): Promise<void> {
    await this.authService.logout(res);
    res.status(HttpStatus.OK).json({ message: HttpResponse.LOGOUT_SUCCESS });
    return;
  }

  async refreshAccessToken(req: Request, res: Response) {
    const { refreshToken } = req.cookies;
    await this.authService.handleRefreshToken(refreshToken, res);
    return;
  }
}
