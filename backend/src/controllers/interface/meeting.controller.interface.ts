import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface IMeetingController {
  createMeeting(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
  validateMeetingAccess(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
  joinMeeting(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
  endMeeting(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
  leaveMeeting(req: AuthenticatedRequest, res: Response): Promise<Response<any>>;
}
