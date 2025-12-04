import { Router } from 'express';
import { container } from '../inversify.config';
import authMiddleware from '../middlewares/verifyToken.middleware';
import { allowRoles } from '../middlewares/role.middleware';
import { TYPES } from '../shared/types/inversify.types';
import { ITrainerDashboardController } from '../controllers/interface/trainerDashboard.controller.interface';

const trainerRouter = Router();
const dashboardController = container.get<ITrainerDashboardController>(
    TYPES.TrainerDashboardController,
);

trainerRouter.use(authMiddleware);
trainerRouter.use(allowRoles('trainer'));

trainerRouter.get('/dashboard', (req, res, next) => {
    dashboardController.getSnapshot(req, res).catch(next);
});

export default trainerRouter;
