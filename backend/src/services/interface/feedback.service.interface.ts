import { IFeedback } from "../../models/feedback.model";

export interface IFeedbackService {
  createOrUpdateFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date,
    feedback: string
  ): Promise<IFeedback>;

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
