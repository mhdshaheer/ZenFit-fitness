import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../const/statuscode.const";
import { HttpResponse } from "../const/response_message.const";
import { env } from "../config/env.config";
import logger from "../utils/logger";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ message: HttpResponse.NO_TOKEN });
    return;
  }

  try {
    const decoded = jwt.verify(accessToken, env.jwt_access!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    logger.error(error);
    res
      .status(HttpStatus.FORBIDDEN)
      .json({ message: HttpResponse.TOKEN_EXPIRED });
    return;
  }
};

export default authMiddleware;
