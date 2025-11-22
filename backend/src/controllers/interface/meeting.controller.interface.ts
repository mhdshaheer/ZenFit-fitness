import { Request, Response } from "express";

export interface IMeetingController {
  createMeeting(req: Request, res: Response): Promise<Response<any>>;
  validateMeetingAccess(req: Request, res: Response): Promise<Response<any>>;
  joinMeeting(req: Request, res: Response): Promise<Response<any>>;
  endMeeting(req: Request, res: Response): Promise<Response<any>>;
  leaveMeeting(req: Request, res: Response): Promise<Response<any>>;
}
