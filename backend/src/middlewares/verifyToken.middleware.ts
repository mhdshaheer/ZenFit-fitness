import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { HttpStatus } from "../const/statuscode.const";
import { HttpResponse } from "../const/response_message.const";
import { env } from "../config/env.config";
import logger from "../shared/services/logger.service";
import { UserRepository } from "../repositories/implimentation/user.repository";
import {
  AuthenticatedRequest,
  AuthenticatedUser,
} from "../types/authenticated-request.type";
import { IJwtPayload } from "../interfaces/auth.interface";

const authMiddleware: RequestHandler = async (req, res, next) => {
  const request = req as AuthenticatedRequest;
  const userRepository = new UserRepository();
  const { accessToken } = req.cookies;

  if (!accessToken) {
    res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ message: HttpResponse.NO_TOKEN });
    return;
  }

  try {
    const decoded = jwt.verify(accessToken, env.jwt_access!) as IJwtPayload;
    if (decoded?.id) {
      const user = await userRepository.findById(decoded.id);

      if (!user) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: HttpResponse.USER_NOT_FOUND });
        return;
      }

      if (user.status === "blocked") {
        res
          .status(HttpStatus.FORBIDDEN)
          .json({ message: HttpResponse.ACCESS_DENIED });
        return;
      }
      const authUser: AuthenticatedUser = {
        id: decoded.id,
        role: decoded.role,
      };
      request.user = authUser;
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
