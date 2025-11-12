import { IMeetingService, MeetingValidation } from "../interface/meeting.service.interface";
import { IMeetingRepository } from "../../repositories/interface/meeting.repository.interface";
import { IBookingRepository } from "../../repositories/interface/booking.repository.interface";
import { ISlotRepository } from "../../repositories/interface/slot.repository.interface";
import { IMeeting } from "../../models/meeting.model";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { v4 as uuidv4 } from 'uuid';

export class MeetingService implements IMeetingService {
  constructor(
    private _meetingRepository: IMeetingRepository,
    private _bookingRepository: IBookingRepository,
    private _slotRepository: ISlotRepository
  ) {}

  async createMeeting(slotId: string, hostId: string): Promise<{ meetingId: string }> {
    console.log('📝 Creating meeting for slot:', slotId, 'host:', hostId);

    // Check if active meeting already exists
    const existingMeeting = await this._meetingRepository.findActiveBySlotId(slotId);
    if (existingMeeting) {
      console.log('✅ Meeting already exists:', existingMeeting.meetingId);
      return { meetingId: existingMeeting.meetingId };
    }

    // Create new meeting
    const meetingId = uuidv4();
    const meeting = await this._meetingRepository.create({
      meetingId,
      slotId,
      hostId,
      participants: [],
      status: 'active',
      startTime: new Date(),
    } as any);

    console.log('✅ Meeting created:', meeting.meetingId);
    return { meetingId: meeting.meetingId };
  }

  async validateMeetingAccess(
    slotId: string,
    userId: string,
    bookingId?: string
  ): Promise<MeetingValidation> {
    console.log('🔍 Validating meeting access for user:', userId, 'slot:', slotId);

    // For now, allow access if meeting exists (booking validation can be added later)
    // Check if meeting exists and is active
    const meeting = await this._meetingRepository.findActiveBySlotId(slotId);
    
    if (!meeting) {
      console.log('❌ No active meeting found');
      return {
        isValid: true,
        canJoin: false,
        message: 'The meeting has not started yet. Please wait for the trainer to start the session.',
      };
    }

    console.log('✅ Access validated, meeting ID:', meeting.meetingId);
    return {
      isValid: true,
      canJoin: true,
      message: 'You can join the meeting.',
      meetingId: meeting.meetingId,
    };
  }

  async joinMeeting(meetingId: string, userId: string, slotId: string): Promise<IMeeting> {
    console.log('👤 User joining meeting:', meetingId);

    // Find meeting
    const meeting = await this._meetingRepository.findByMeetingId(meetingId);
    
    if (!meeting) {
      throw new AppError("Meeting not found", HttpStatus.NOT_FOUND);
    }

    if (meeting.status !== 'active') {
      throw new AppError("Meeting has ended", HttpStatus.BAD_REQUEST);
    }

    // Verify slot matches
    if (meeting.slotId.toString() !== slotId) {
      throw new AppError("Invalid meeting for this slot", HttpStatus.FORBIDDEN);
    }

    // Check if user already in meeting
    const isAlreadyIn = await this._meetingRepository.isUserInMeeting(meetingId, userId);
    if (isAlreadyIn) {
      console.log('ℹ️ User already in meeting');
      return meeting;
    }

    // Add participant
    const updatedMeeting = await this._meetingRepository.addParticipant(meetingId, userId);
    
    if (!updatedMeeting) {
      throw new AppError("Failed to join meeting", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    console.log('✅ User joined meeting');
    return updatedMeeting;
  }

  async endMeeting(meetingId: string, hostId: string): Promise<void> {
    console.log('🛑 Ending meeting:', meetingId);

    const meeting = await this._meetingRepository.findByMeetingId(meetingId);
    
    if (!meeting) {
      throw new AppError("Meeting not found", HttpStatus.NOT_FOUND);
    }

    // Verify user is host
    if (meeting.hostId.toString() !== hostId) {
      throw new AppError("Only the host can end the meeting", HttpStatus.FORBIDDEN);
    }

    if (meeting.status === 'ended') {
      console.log('ℹ️ Meeting already ended');
      return;
    }

    await this._meetingRepository.endMeeting(meetingId);
    console.log('✅ Meeting ended');
  }

  async leaveMeeting(meetingId: string, userId: string): Promise<void> {
    console.log('👋 User leaving meeting:', meetingId);

    const meeting = await this._meetingRepository.findByMeetingId(meetingId);
    
    if (!meeting) {
      throw new AppError("Meeting not found", HttpStatus.NOT_FOUND);
    }

    await this._meetingRepository.removeParticipant(meetingId, userId);
    console.log('✅ User left meeting');
  }
}
