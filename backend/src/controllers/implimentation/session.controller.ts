import { Request, Response } from "express";
import { ISessionController } from "../interface/session.controller.interface";
import { ISessionService } from "../../services/interface/session.service.interface";
import { TYPES } from "../../types/inversify.types";
import { inject } from "inversify";
import { HttpStatus } from "../../const/statuscode.const";

export class SessionController implements ISessionController {
  constructor(
    @inject(TYPES.SessionService) private sessionService: ISessionService
  ) {}
  async saveDraftSession(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const userId = (req as any).user.id;
      data.trainerId = userId;
      console.log("Session draft data :", data);

      if (!data) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Session data is required" });
        return;
      }

      let slotStatus = "draft";
      const sessionDraft = await this.sessionService.saveSession(
        userId,
        slotStatus,
        data
      );
      console.log("stored data from the db :", sessionDraft);

      if (!sessionDraft) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to save session draft" });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: "session draft is saved successfully",
      });
      return;
    } catch (error: any) {
      console.error("Error saving session draft:", error);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while saving the session draft",
        error: error.message || "Unexpected error",
      });
    }
  }
  async saveSession(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const userId = (req as any).user.id;
      data.trainerId = userId;
      console.log("Session data :", data);

      if (!data) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: "Session data is required" });
        return;
      }

      let slotStatus = "active";
      const session = await this.sessionService.saveSession(
        userId,
        slotStatus,
        data
      );
      console.log("stored data from the db :", session);

      if (!session) {
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: "Failed to save session" });
        return;
      }

      res.status(HttpStatus.OK).json({
        message: "session is saved successfully",
      });
      return;
    } catch (error: any) {
      console.error("Error saving session:", error);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred while saving the session ",
        error: error.message || "Unexpected error",
      });
    }
  }
}
