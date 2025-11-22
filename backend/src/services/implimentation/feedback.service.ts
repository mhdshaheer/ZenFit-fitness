import { inject, injectable } from "inversify";
import { IFeedbackService } from "../interface/feedback.service.interface";
import { IFeedbackRepository } from "../../repositories/interface/feedback.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { IFeedback } from "../../models/feedback.model";

@injectable()
export class FeedbackService implements IFeedbackService {
  @inject(TYPES.FeedbackRepository)
  private readonly _feedbackRepository!: IFeedbackRepository;

  async createOrUpdateFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date,
    feedback: string
  ): Promise<IFeedback> {
    // Try to find existing feedback first
    const existingFeedback = await this._feedbackRepository.getFeedbackBySlotAndDate(
      slotId,
      sessionDate
    );

    if (existingFeedback) {
      // Update existing feedback
      const updatedFeedback = await this._feedbackRepository.updateFeedback(
        slotId,
        trainerId,
        sessionDate,
        feedback
      );
      
      if (!updatedFeedback) {
        throw new Error("Failed to update feedback");
      }
      
      return updatedFeedback;
    } else {
      // Create new feedback
      return await this._feedbackRepository.createFeedback(
        slotId,
        trainerId,
        sessionDate,
        feedback
      );
    }
  }

  async getFeedbackBySlotAndDate(
    slotId: string,
    sessionDate: Date
  ): Promise<IFeedback | null> {
    return await this._feedbackRepository.getFeedbackBySlotAndDate(
      slotId,
      sessionDate
    );
  }

  async getFeedbacksBySlotId(slotId: string): Promise<IFeedback[]> {
    return await this._feedbackRepository.getFeedbacksBySlotId(slotId);
  }

  async deleteFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date
  ): Promise<boolean> {
    return await this._feedbackRepository.deleteFeedback(
      slotId,
      trainerId,
      sessionDate
    );
  }
}
