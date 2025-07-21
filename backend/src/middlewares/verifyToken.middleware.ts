import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../const/statuscode.const";
import { HttpResponse } from "../const/response_message.const";
import { env } from "../config/env.config";
import logger from "../utils/logger";
import { AuthRepository } from "../repositories/implimentation/auth.repository";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authRepository = new AuthRepository();
  const { accessToken } = req.cookies;

  if (!accessToken) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ message: HttpResponse.NO_TOKEN });
    return;
  }

  try {
    const decoded = jwt.verify(accessToken, env.jwt_access!);
    if (typeof decoded === "object" && "id" in decoded) {
      const user = await authRepository.findById(decoded.id);

      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "User not found" });
        return;
      }

      if (user.status == "blocked") {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: "Your account has been blocked." });
        return;
      }

      (req as any).user = decoded;
      next();
    }
    // (req as any).user = decoded;
    // console.log("decoded : ", decoded);
    // const currUser = await authRepository.findById(decoded?.id);
    // next();
  } catch (error) {
    logger.error(error);
    res
      .status(HttpStatus.FORBIDDEN)
      .json({ message: HttpResponse.TOKEN_EXPIRED });
    return;
  }
};

export default authMiddleware;
