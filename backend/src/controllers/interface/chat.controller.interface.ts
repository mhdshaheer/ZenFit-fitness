import { Request, Response } from "express";

export interface IChatController {
    initThread(req: Request, res: Response): Promise<void>;
    getThreads(req: Request, res: Response): Promise<void>;
    getTrainerThreads(req: Request, res: Response): Promise<void>;
    getMessages(req: Request, res: Response): Promise<void>;
    markRead(req: Request, res: Response): Promise<void>;
    sendMessage(req: Request, res: Response): Promise<void>;
}