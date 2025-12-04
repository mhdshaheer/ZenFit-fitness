import { Response } from "express";
import { IMeetingController } from "../interface/meeting.controller.interface";
import { IMeetingService } from "../../services/interface/meeting.service.interface";
import { HttpStatus } from "../../const/statuscode.const";
import { AppError } from "../../shared/utils/appError.util";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export class MeetingController implements IMeetingController {
  constructor(private _meetingService: IMeetingService) { }

  async createMeeting(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<any>> {
    const { slotId } = req.body;
    const hostId = req.user?.id;

    if (!hostId) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    if (!slotId) {
      throw new AppError("Slot ID is required", HttpStatus.BAD_REQUEST);
    }

    const result = await this._meetingService.createMeeting(slotId, hostId);
    return res.status(HttpStatus.CREATED).json(result);
  }

  async validateMeetingAccess(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<any>> {
    const { slotId, bookingId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    if (!slotId) {
      throw new AppError("Slot ID is required", HttpStatus.BAD_REQUEST);
    }

    const validation = await this._meetingService.validateMeetingAccess(slotId, userId, bookingId);
    return res.status(HttpStatus.OK).json(validation);
  }

  async joinMeeting(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<any>> {
    const { meetingId, slotId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    if (!meetingId || !slotId) {
      throw new AppError("Meeting ID and Slot ID are required", HttpStatus.BAD_REQUEST);
    }

    const meeting = await this._meetingService.joinMeeting(meetingId, userId, slotId);
    return res.status(HttpStatus.OK).json(meeting);
  }

  async endMeeting(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<any>> {
    const { meetingId } = req.params;
    const hostId = req.user?.id;

    if (!hostId) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    await this._meetingService.endMeeting(meetingId, hostId);
    return res.status(HttpStatus.OK).json({ message: "Meeting ended successfully" });
  }

  async leaveMeeting(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<any>> {
    const { meetingId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    await this._meetingService.leaveMeeting(meetingId, userId);
    return res.status(HttpStatus.OK).json({ message: "Left meeting successfully" });
  }
}
