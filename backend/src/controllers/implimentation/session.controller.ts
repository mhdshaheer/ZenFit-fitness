import { Request, Response } from "express";
import { ISessionController } from "../interface/session.controller.interface";
import { ISessionService } from "../../services/interface/session.service.interface";
import { inject } from "inversify";
import { HttpStatus } from "../../const/statuscode.const";
import { TYPES } from "../../shared/types/inversify.types";
import { ISession } from "../../models/session.model";
import { AppError } from "../../shared/utils/appError.util";
import { HttpResponse } from "../../const/response_message.const";

export class SessionController implements ISessionController {
  constructor(
    @inject(TYPES.SessionService)
    private readonly _sessionService: ISessionService
  ) {}
  async saveDraftSession(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const userId = (req as any).user.id;

    if (!data) {
      throw new AppError(
        HttpResponse.SESSION_DATA_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    data.trainerId = userId;
    const slotStatus = "draft";

    const sessionDraft = await this._sessionService.saveSession(
      userId,
      slotStatus,
      data
    );

    if (!sessionDraft) {
      throw new AppError(
        HttpResponse.SESSION_SAVE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    res.status(HttpStatus.OK).json({
      message: HttpResponse.SESSION_SAVE_SUCCESS,
    });
    return;
  }
  async saveSession(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const userId = (req as any).user?.id;

    if (!data) {
      throw new AppError(
        HttpResponse.SESSION_DATA_REQUIRED,
        HttpStatus.BAD_REQUEST
      );
    }

    data.trainerId = userId;
    const slotStatus = "active";

    const session = await this._sessionService.saveSession(
      userId,
      slotStatus,
      data
    );

    if (!session) {
      throw new AppError(
        HttpResponse.SESSION_SAVE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    res.status(HttpStatus.OK).json({
      message: HttpResponse.SESSION_SAVE_SUCCESS,
    });
  }
  async getSession(req: Request, res: Response): Promise<Response<ISession>> {
    const { id } = req.params;
    const session = await this._sessionService.getSession(id);
    if (!session) {
      throw new AppError(HttpResponse.SESSION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    return res.status(HttpStatus.OK).json(session);
  }
}
