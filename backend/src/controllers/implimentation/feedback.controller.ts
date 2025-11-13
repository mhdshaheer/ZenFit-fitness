import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IFeedbackController } from "../interface/feedback.controller.interface";
import { IFeedbackService } from "../../services/interface/feedback.service.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";

@injectable()
export class FeedbackController implements IFeedbackController {
  @inject(TYPES.FeedbackService)
  private readonly _feedbackService!: IFeedbackService;

  async createOrUpdateFeedback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req as any).user.id;
      const { slotId, sessionDate, feedback } = req.body;

      if (!slotId || !sessionDate || !feedback) {
        throw new AppError(
          "Missing required fields: slotId, sessionDate, feedback",
          HttpStatus.BAD_REQUEST
        );
      }

      if (feedback.length > 1000) {
        throw new AppError(
          "Feedback cannot exceed 1000 characters",
          HttpStatus.BAD_REQUEST
        );
      }

      const feedbackData = await this._feedbackService.createOrUpdateFeedback(
        slotId,
        trainerId,
        new Date(sessionDate),
        feedback.trim()
      );

      res.status(HttpStatus.OK).json({
        message: "Feedback saved successfully",
        feedback: feedbackData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeedbackBySlotAndDate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slotId, sessionDate } = req.query;

      if (!slotId || !sessionDate) {
        throw new AppError(
          "Missing required parameters: slotId, sessionDate",
          HttpStatus.BAD_REQUEST
        );
      }

      const feedback = await this._feedbackService.getFeedbackBySlotAndDate(
        slotId as string,
        new Date(sessionDate as string)
      );

      res.status(HttpStatus.OK).json(feedback);
    } catch (error) {
      next(error);
    }
  }

  async getFeedbacksBySlotId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { slotId } = req.params;

      if (!slotId) {
        throw new AppError("Missing slotId parameter", HttpStatus.BAD_REQUEST);
      }

      const feedbacks = await this._feedbackService.getFeedbacksBySlotId(slotId);
      res.status(HttpStatus.OK).json(feedbacks);
    } catch (error) {
      next(error);
    }
  }

  async deleteFeedback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const trainerId = (req as any).user.id;
      const { slotId, sessionDate } = req.body;

      if (!slotId || !sessionDate) {
        throw new AppError(
          "Missing required fields: slotId, sessionDate",
          HttpStatus.BAD_REQUEST
        );
      }

      const deleted = await this._feedbackService.deleteFeedback(
        slotId,
        trainerId,
        new Date(sessionDate)
      );

      if (!deleted) {
        throw new AppError("Feedback not found", HttpStatus.NOT_FOUND);
      }

      res.status(HttpStatus.OK).json({
        message: "Feedback deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
