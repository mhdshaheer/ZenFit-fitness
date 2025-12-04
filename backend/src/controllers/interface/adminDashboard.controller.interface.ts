import { Request, Response } from 'express';

export interface IAdminDashboardController {
    getSnapshot(req: Request, res: Response): Promise<void>;
}
