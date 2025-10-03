import { IAppError } from "../types/error.interface";

export class AppError extends Error implements IAppError {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;

    // Ensure prototype chain is correct
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture clean stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
