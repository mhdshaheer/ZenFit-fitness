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
import { AppError } from "../../shared/utils/appError.util";

@injectable()
export class AuthController implements IAuthController {
  constructor(@inject(TYPES.AuthService) private _authService: IAuthService) {}

  async signup(req: Request, res: Response): Promise<void> {
    const { username, email, password, dob, gender, role } = req.body;

    if (!username || !email || !password || !dob || !gender || !role) {
      throw new AppError(HttpResponse.FIELDS_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const user = await this._authService.signup({
      username,
      email,
      password,
      dob,
      gender,
      role,
    });

    if (!user) {
      throw new AppError(
        HttpResponse.USER_CREATION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    res.status(HttpStatus.OK).json({
      message: HttpResponse.USER_CREATION_SUCCESS,
      user,
    });
  }
  async sendOtp(req: Request, res: Response): Promise<void> {
    await this._authService.sendOtp(req, res);
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    await this._authService.verifyOtp(req, res);
  }

  async resendOtp(req: Request, res: Response): Promise<void> {
    await this._authService.resendOtp(req, res);
  }
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(HttpResponse.FIELDS_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { user, accessToken, refreshToken } = await this._authService.login(
      email,
      password
    );

    if (!user) {
      throw new AppError(
        HttpResponse.INVALID_EMAIL_PASSWORD,
        HttpStatus.UNAUTHORIZED
      );
    }

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(HttpStatus.OK).json({
      message: HttpResponse.LOGIN_SUCCESS,
      accessToken,
      role: user.role,
      user: { id: user._id, username: user.username, email: user.email },
    });
  }
  async sendForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw new AppError(HttpResponse.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const result = await this._authService.sendForgotPasswordOtp(email);
    res.status(HttpStatus.OK).json(result);
  }
  async verifyForgotOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError(
        HttpResponse.EMAIL_OTP_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    const result = await this._authService.verifyForgotOtp(email, otp);
    res.status(HttpStatus.OK).json(result);
  }
  async resetPassword(req: Request, res: Response): Promise<void> {
    await this._authService.resetPassword(req, res);
  }

  async googleCallback(req: Request, res: Response): Promise<void> {
    const user = req.user as any;
    if (!user)
      {throw new AppError(
        HttpResponse.GOOGLE_AUTH_FAILED,
        HttpStatus.UNAUTHORIZED
      );}

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({
      id: user._id,
      role: user.role,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(
      `${env.frontend_url}/user/dashboard?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
  async logOut(_req: Request, res: Response): Promise<void> {
    await this._authService.logout(res);
    res.status(HttpStatus.OK).json({ message: HttpResponse.LOGOUT_SUCCESS });
  }

  async refreshAccessToken(req: Request, res: Response) {
    const { refreshToken } = req.cookies;
    await this._authService.handleRefreshToken(refreshToken, res);
  }
}
