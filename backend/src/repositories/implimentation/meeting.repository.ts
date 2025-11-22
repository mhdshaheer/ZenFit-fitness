import { IMeetingRepository } from "../interface/meeting.repository.interface";
import { IMeeting, MeetingModel } from "../../models/meeting.model";
import { Types } from "mongoose";

export class MeetingRepository implements IMeetingRepository {
  constructor(private model: typeof MeetingModel) {}

  async create(meetingData: Partial<IMeeting>): Promise<IMeeting> {
    const meeting = new this.model(meetingData);
    return await meeting.save();
  }

  async findByMeetingId(meetingId: string): Promise<IMeeting | null> {
    return await this.model
      .findOne({ meetingId })
      .populate('hostId', 'fullName email')
      .populate('participants.userId', 'fullName email');
  }

  async findActiveBySlotId(slotId: string): Promise<IMeeting | null> {
    return await this.model
      .findOne({
        slotId: new Types.ObjectId(slotId),
        status: 'active',
      })
      .populate('hostId', 'fullName email')
      .populate('participants.userId', 'fullName email');
  }

  async findByHostId(hostId: string): Promise<IMeeting[]> {
    return await this.model
      .find({
        hostId: new Types.ObjectId(hostId),
        status: 'active',
      })
      .populate('slotId')
      .sort({ startTime: -1 });
  }

  async addParticipant(meetingId: string, userId: string): Promise<IMeeting | null> {
    return await this.model.findOneAndUpdate(
      { meetingId },
      {
        $push: {
          participants: {
            userId: new Types.ObjectId(userId),
            joinedAt: new Date(),
          },
        },
      },
      { new: true }
    );
  }

  async removeParticipant(meetingId: string, userId: string): Promise<IMeeting | null> {
    return await this.model.findOneAndUpdate(
      { meetingId, 'participants.userId': new Types.ObjectId(userId) },
      {
        $set: {
          'participants.$.leftAt': new Date(),
        },
      },
      { new: true }
    );
  }

  async endMeeting(meetingId: string): Promise<IMeeting | null> {
    return await this.model.findOneAndUpdate(
      { meetingId },
      {
        status: 'ended',
        endTime: new Date(),
      },
      { new: true }
    );
  }

  async isUserInMeeting(meetingId: string, userId: string): Promise<boolean> {
    const meeting = await this.model.findOne({
      meetingId,
      'participants.userId': new Types.ObjectId(userId),
      'participants.leftAt': { $exists: false },
    });
    return !!meeting;
  }
}
