import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ITrainerDashboardController } from '../interface/trainerDashboard.controller.interface';
import { ITrainerDashboardService } from '../../services/interface/trainerDashboard.service.interface';
import { TYPES } from '../../shared/types/inversify.types';
import { HttpStatus } from '../../const/statuscode.const';

@injectable()
export class TrainerDashboardController implements ITrainerDashboardController {
    constructor(
        @inject(TYPES.TrainerDashboardService)
        private readonly _trainerDashboardService: ITrainerDashboardService,
    ) { }

    async getSnapshot(req: Request, res: Response): Promise<Response<any>> {
        const trainer = (req as any).user;
        const trainerId = trainer?.id;
        const role = trainer?.role;

        if (!trainerId || role !== 'trainer') {
            return res.status(HttpStatus.UNAUTHORIZED).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        try {
            const snapshot = await this._trainerDashboardService.getSnapshot(trainerId);
            return res.status(HttpStatus.OK).json({ success: true, data: snapshot });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    }
}
