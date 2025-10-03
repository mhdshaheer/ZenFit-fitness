import { Request, Response, NextFunction } from "express";
import { IAppError } from "../shared/types/error.interface";
import logger from "../shared/services/logger.service";
import { HttpStatus } from "../const/statuscode.const";
import { env } from "../config/env.config";

interface ErrorResponse {
  message: string;
  stack?: string;
}

export const errorMiddleware = (
  err: IAppError,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
) => {
  const status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong";

  logger.error(err);

  const response: ErrorResponse = { message };
  if (env.node === "development") {
    response.stack = err.stack;
  }

  res.status(status).json(response);
};
