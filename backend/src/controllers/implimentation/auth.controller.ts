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
import { IUser } from "../../interfaces/user.interface";
import { setAuthCookies } from "../../shared/utils/cookie.util";

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject(TYPES.AuthService) private readonly _authService: IAuthService
  ) { }

  async signup(req: Request, res: Response): Promise<void> {
    const { username, email, password, dob, gender, role } = req.body;

    if (
      typeof username !== "string" || username === "" ||
      typeof email !== "string" || email === "" ||
      typeof password !== "string" || password === "" ||
      typeof dob !== "string" || dob === "" ||
      typeof gender !== "string" || gender === "" ||
      typeof role !== "string" || role === ""
    ) {
      throw new AppError(HttpResponse.FIELDS_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const user = await this._authService.signup({
      username,
      email,
      password,
      dob: new Date(dob as string),
      gender: gender as "male" | "female" | "other",
      role: role as "admin" | "trainer" | "user",
    });

    if (user === null || user === undefined) {
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

    if (typeof email !== "string" || email === "" || typeof password !== "string" || password === "") {
      throw new AppError(HttpResponse.FIELDS_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const { user, accessToken, refreshToken } = await this._authService.login(
      email,
      password
    );

    if (user === null || user === undefined) {
      throw new AppError(
        HttpResponse.INVALID_EMAIL_PASSWORD,
        HttpStatus.UNAUTHORIZED
      );
    }

    // Set cookies using utility
    setAuthCookies(res, accessToken, refreshToken);

    res.status(HttpStatus.OK).json({
      message: HttpResponse.LOGIN_SUCCESS,
      accessToken,
      role: user.role,
      user: { id: user._id, username: user.username, email: user.email },
    });
  }
  async sendForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (typeof email !== "string" || email === "") {
      throw new AppError(HttpResponse.EMAIL_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const result = await this._authService.sendForgotPasswordOtp(email);
    res.status(HttpStatus.OK).json(result);
  }
  async verifyForgotOtp(req: Request, res: Response): Promise<void> {
    const { email, otp } = req.body;

    if (typeof email !== "string" || email === "" || typeof otp !== "string" || otp === "") {
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
    const user = req.user as unknown as IUser;
    if (user === null || user === undefined) {
      throw new AppError(
        HttpResponse.GOOGLE_AUTH_FAILED,
        HttpStatus.UNAUTHORIZED
      );
    }

    const accessToken = generateAccessToken({ id: user._id! as unknown as string, role: user.role! });
    const refreshToken = generateRefreshToken({
      id: user._id! as unknown as string,
      role: user.role!,
    });

    // Set cookies using utility
    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(
      `${env.frontend_url}/auth/google-callback?accessToken=${accessToken}&refreshToken=${refreshToken}&role=${user.role}`
    );
  }
  async logOut(_req: Request, res: Response): Promise<void> {
    await this._authService.logout(res);
    res.status(HttpStatus.OK).json({ message: HttpResponse.LOGOUT_SUCCESS });
  }

  async refreshAccessToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.cookies;
    await this._authService.handleRefreshToken(refreshToken, res);
  }
  async getUserId(
    req: Request,
    res: Response
  ): Promise<Response<{ userId: string }>> {
    const user = (req as any).user;
    if (!user || !user.id) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: "User not authenticated" } as any);
    }
    return res.status(HttpStatus.OK).json({ userId: user.id });
  }
}
