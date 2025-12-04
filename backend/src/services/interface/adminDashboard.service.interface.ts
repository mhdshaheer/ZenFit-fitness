import { AdminDashboardFilters, AdminDashboardSnapshot } from '../../interfaces/adminDashboard.interface';

export interface IAdminDashboardService {
    getSnapshot(filters?: AdminDashboardFilters): Promise<AdminDashboardSnapshot>;
}
