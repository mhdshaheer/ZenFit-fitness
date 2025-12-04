import { Request, Response } from 'express';

export interface ITrainerDashboardController {
    getSnapshot(req: Request, res: Response): Promise<Response<any>>;
}
