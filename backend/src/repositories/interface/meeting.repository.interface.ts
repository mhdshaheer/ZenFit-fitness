import { IMeeting } from "../../models/meeting.model";

export interface IMeetingRepository {
  create(meetingData: Partial<IMeeting>): Promise<IMeeting>;
  findByMeetingId(meetingId: string): Promise<IMeeting | null>;
  findActiveBySlotId(slotId: string): Promise<IMeeting | null>;
  findByHostId(hostId: string): Promise<IMeeting[]>;
  addParticipant(meetingId: string, userId: string): Promise<IMeeting | null>;
  removeParticipant(meetingId: string, userId: string): Promise<IMeeting | null>;
  endMeeting(meetingId: string): Promise<IMeeting | null>;
  isUserInMeeting(meetingId: string, userId: string): Promise<boolean>;
}
