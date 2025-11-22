export interface IFeedbackData {
  _id: string;
  slotId: string;
  trainerId: string;
  sessionDate: Date;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateFeedbackRequest {
  slotId: string;
  sessionDate: Date;
  feedback: string;
}

export interface IUpdateFeedbackRequest {
  feedback: string;
}
