import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../const/statuscode.const";
import { HttpResponse } from "../const/response_message.const";
import { env } from "../config/env.config";
import logger from "../shared/services/logger.service";
import { UserRepository } from "../repositories/implimentation/user.repository";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userRepository = new UserRepository();
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
      const user = await userRepository.findById(decoded.id);

      if (!user) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: HttpResponse.USER_NOT_FOUND });
        return;
      }

      if (user.status == "blocked") {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: HttpResponse.ACCESS_DENIED });
        return;
      }
      (req as any).user = decoded;
      next();
    }
  } catch (error) {
    logger.error(error);
    res
      .status(HttpStatus.FORBIDDEN)
      .json({ message: HttpResponse.TOKEN_EXPIRED });
    return;
  }
};

export default authMiddleware;
