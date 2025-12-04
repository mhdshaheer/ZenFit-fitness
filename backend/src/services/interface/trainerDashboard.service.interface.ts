import { TrainerDashboardSnapshot } from '../../interfaces/dashboard.interface';

export interface ITrainerDashboardService {
    getSnapshot(trainerId: string): Promise<TrainerDashboardSnapshot>;
}
