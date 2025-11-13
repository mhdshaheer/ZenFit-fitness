import { injectable } from "inversify";
import { IFeedbackRepository } from "../interface/feedback.repository.interface";
import { IFeedback, Feedback } from "../../models/feedback.model";

@injectable()
export class FeedbackRepository implements IFeedbackRepository {
  async createFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date,
    feedback: string
  ): Promise<IFeedback> {
    // Normalize the date to start of day for consistent storage
    const normalizedDate = new Date(sessionDate);
    normalizedDate.setHours(0, 0, 0, 0);

    const newFeedback = new Feedback({
      slotId,
      trainerId,
      sessionDate: normalizedDate,
      feedback,
    });

    return await newFeedback.save();
  }

  async updateFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date,
    feedback: string
  ): Promise<IFeedback | null> {
    // Normalize the date to start of day for comparison
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    return await Feedback.findOneAndUpdate(
      {
        slotId,
        trainerId,
        sessionDate: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      },
      {
        feedback,
      },
      {
        new: true,
      }
    );
  }

  async getFeedbackBySlotAndDate(
    slotId: string,
    sessionDate: Date
  ): Promise<IFeedback | null> {
    // Normalize the date to start of day for comparison
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    return await Feedback.findOne({
      slotId,
      sessionDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
  }

  async getFeedbacksBySlotId(slotId: string): Promise<IFeedback[]> {
    return await Feedback.find({
      slotId,
    }).sort({ sessionDate: -1 });
  }

  async deleteFeedback(
    slotId: string,
    trainerId: string,
    sessionDate: Date
  ): Promise<boolean> {
    // Normalize the date to start of day for comparison
    const startOfDay = new Date(sessionDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(sessionDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await Feedback.deleteOne({
      slotId,
      trainerId,
      sessionDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    return result.deletedCount > 0;
  }
}
