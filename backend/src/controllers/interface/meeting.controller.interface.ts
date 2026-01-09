import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface IMeetingController {
  createMeeting(req: AuthenticatedRequest, res: Response): Promise<Response>;
  validateMeetingAccess(req: AuthenticatedRequest, res: Response): Promise<Response>;
  joinMeeting(req: AuthenticatedRequest, res: Response): Promise<Response>;
  endMeeting(req: AuthenticatedRequest, res: Response): Promise<Response>;
  leaveMeeting(req: AuthenticatedRequest, res: Response): Promise<Response>;
}
