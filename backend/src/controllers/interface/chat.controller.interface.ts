import { Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface IChatController {
    initThread(req: AuthenticatedRequest, res: Response): Promise<void>;
    getThreads(req: AuthenticatedRequest, res: Response): Promise<void>;
    getTrainerThreads(req: AuthenticatedRequest, res: Response): Promise<void>;
    getMessages(req: AuthenticatedRequest, res: Response): Promise<void>;
    markRead(req: AuthenticatedRequest, res: Response): Promise<void>;
    sendMessage(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void>;
}