import { IMeetingService, MeetingValidation } from "../interface/meeting.service.interface";
import { IMeetingRepository } from "../../repositories/interface/meeting.repository.interface";
import { IBookingRepository } from "../../repositories/interface/booking.repository.interface";
import { ISlotInstanceRepository } from "../../repositories/interface/slotInstance.repository.interface";
import { IMeeting } from "../../models/meeting.model";
import { ISlotInstance } from "../../models/slotInstance.model";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { v4 as uuidv4 } from 'uuid';
import { INotificationService } from "../interface/notification.service.interface";

export class MeetingService implements IMeetingService {
  constructor(
    private _meetingRepository: IMeetingRepository,
    private _bookingRepository: IBookingRepository,
    private _slotInstanceRepository: ISlotInstanceRepository,
    private _notificationService: INotificationService
  ) { }

  private async notifySlotUsers(
    slotInstanceId: string,
    title: string,
    messageFactory: (slot: ISlotInstance) => string,
    options?: { date?: Date; fallbackToAll?: boolean }
  ): Promise<void> {
    const slot = await this._slotInstanceRepository.findById(slotInstanceId);
    if (!slot) {
      return;
    }

    let bookings = options?.date
      ? await this._bookingRepository.getBookingsForSlotOnDate(slotInstanceId, options.date)
      : await this._bookingRepository.getBookingsBySlotId(slotInstanceId);

    if ((!bookings || bookings.length === 0) && options?.date && options?.fallbackToAll !== false) {
      bookings = await this._bookingRepository.getBookingsBySlotId(slotInstanceId);
    }

    if (!bookings.length) {
      return;
    }

    const message = messageFactory(slot);

    const uniqueReceiverIds = Array.from(
      new Set(
        bookings
          .map((b: any) => (b.userId?._id ?? b.userId)?.toString())
          .filter((id): id is string => Boolean(id))
      )
    );

    await Promise.all(
      uniqueReceiverIds.map(async (receiverId) => {
        await this._notificationService.createNotification(
          receiverId,
          'user',
          title,
          message
        );
      })
    );

  }

  async createMeeting(slotInstanceId: string, hostId: string): Promise<{ meetingId: string }> {

    // Check if active meeting already exists
    const existingMeeting = await this._meetingRepository.findActiveBySlotId(slotInstanceId);
    if (existingMeeting) {
      return { meetingId: existingMeeting.meetingId };
    }

    // Create new meeting
    const meetingId = uuidv4();
    const meeting = await this._meetingRepository.create({
      meetingId,
      slotId: slotInstanceId,
      hostId,
      participants: [],
      status: 'active',
      startTime: new Date(),
    } as any);


    try {
      await this.notifySlotUsers(
        slotInstanceId,
        'Session started',
        (slot) => {
          return `Your session (${slot.startTime} - ${slot.endTime}) has started. Join now.`;
        },
        { date: new Date(), fallbackToAll: true }
      );
    } catch (err) {
      console.error('Failed to send meeting start notifications:', err);
    }
    return { meetingId: meeting.meetingId };
  }

  async validateMeetingAccess(
    slotInstanceId: string,
    userId: string,
    bookingId?: string
  ): Promise<MeetingValidation> {

    // For now, allow access if meeting exists (booking validation can be added later)
    // Check if meeting exists and is active
    const meeting = await this._meetingRepository.findActiveBySlotId(slotInstanceId);

    if (!meeting) {
      return {
        isValid: true,
        canJoin: false,
        message: 'The meeting has not started yet. Please wait for the trainer to start the session.',
      };
    }

    return {
      isValid: true,
      canJoin: true,
      message: 'You can join the meeting.',
      meetingId: meeting.meetingId,
    };
  }

  async joinMeeting(meetingId: string, userId: string, slotInstanceId: string): Promise<IMeeting> {

    // Find meeting
    const meeting = await this._meetingRepository.findByMeetingId(meetingId);

    if (!meeting) {
      throw new AppError("Meeting not found", HttpStatus.NOT_FOUND);
    }

    if (meeting.status !== 'active') {
      throw new AppError("Meeting has ended", HttpStatus.BAD_REQUEST);
    }

    // Verify slot matches
    if (meeting.slotId.toString() !== slotInstanceId) {
      throw new AppError("Invalid meeting for this slot", HttpStatus.FORBIDDEN);
    }

    // Check if user already in meeting
    const isAlreadyIn = await this._meetingRepository.isUserInMeeting(meetingId, userId);
    if (isAlreadyIn) {
      return meeting;
    }

    // Add participant
    const updatedMeeting = await this._meetingRepository.addParticipant(meetingId, userId);

    if (!updatedMeeting) {
      throw new AppError("Failed to join meeting", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return updatedMeeting;
  }

  async endMeeting(meetingId: string, hostId: string): Promise<void> {

    const meeting = await this._meetingRepository.findByMeetingId(meetingId);

    if (!meeting) {
      throw new AppError("Meeting not found", HttpStatus.NOT_FOUND);
    }

    // Verify user is host
    if (meeting.hostId.toString() !== hostId) {
      throw new AppError("Only the host can end the meeting", HttpStatus.FORBIDDEN);
    }

    if (meeting.status === 'ended') {
      return;
    }

    const slotId = meeting.slotId.toString();
    await this._meetingRepository.endMeeting(meetingId);

    try {
      await this.notifySlotUsers(
        slotId,
        'Session ended',
        (slot) => {
          return `Your session on ${slot.date.toDateString()} has ended. Thanks for joining!`;
        },
        { fallbackToAll: true }
      );
    } catch (err) {
      console.error('Failed to send meeting end notifications:', err);
    }
  }

  async leaveMeeting(meetingId: string, userId: string): Promise<void> {

    const meeting = await this._meetingRepository.findByMeetingId(meetingId);

    if (!meeting) {
      throw new AppError("Meeting not found", HttpStatus.NOT_FOUND);
    }

    await this._meetingRepository.removeParticipant(meetingId, userId);
  }
}
