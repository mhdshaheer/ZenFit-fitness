import { IFeedback } from "../../models/feedback.model";

export interface IFeedbackRepository {
  createFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date,
    feedback: string
  ): Promise<IFeedback>;

  updateFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date,
    feedback: string
  ): Promise<IFeedback | null>;

  getFeedbackBySlotAndDate(
    slotId: string,
    sessionDate: Date
  ): Promise<IFeedback | null>;

  getFeedbacksBySlotId(slotId: string): Promise<IFeedback[]>;

  deleteFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date
  ): Promise<boolean>;
}
