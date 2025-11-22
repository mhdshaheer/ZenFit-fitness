import { IMeeting } from "../../models/meeting.model";

export interface MeetingValidation {
  isValid: boolean;
  canJoin: boolean;
  message: string;
  meetingId?: string;
}

export interface IMeetingService {
  createMeeting(slotId: string, hostId: string): Promise<{ meetingId: string }>;
  validateMeetingAccess(slotId: string, userId: string, bookingId?: string): Promise<MeetingValidation>;
  joinMeeting(meetingId: string, userId: string, slotId: string): Promise<IMeeting>;
  endMeeting(meetingId: string, hostId: string): Promise<void>;
  leaveMeeting(meetingId: string, userId: string): Promise<void>;
}
