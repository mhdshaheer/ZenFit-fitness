import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAdminDashboardController } from '../interface/adminDashboard.controller.interface';
import { TYPES } from '../../shared/types/inversify.types';
import { IAdminDashboardService } from '../../services/interface/adminDashboard.service.interface';
import { HttpStatus } from '../../const/statuscode.const';
import { AdminDashboardFilters, AdminRangeFilter, AdminReportScope } from '../../interfaces/adminDashboard.interface';

@injectable()
export class AdminDashboardController implements IAdminDashboardController {
    constructor(
        @inject(TYPES.AdminDashboardService)
        private readonly adminDashboardService: IAdminDashboardService,
    ) { }

    async getSnapshot(req: Request, res: Response): Promise<void> {
        try {
            const filters = this.extractFilters(req);
            const data = await this.adminDashboardService.getSnapshot(filters);
            res.status(HttpStatus.OK).json({ success: true, data });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Failed to load admin dashboard data',
            });
        }
    }

    private extractFilters(req: Request): AdminDashboardFilters {
        const { scope, range } = req.query;
        const filters: AdminDashboardFilters = {};

        if (typeof scope === 'string' && this.isValidScope(scope)) {
            filters.scope = scope as AdminReportScope;
        }

        if (typeof range === 'string' && this.isValidRange(range)) {
            filters.range = range as AdminRangeFilter;
        }

        return filters;
    }

    private isValidScope(value: string): value is AdminReportScope {
        return ['global', 'marketplace', 'direct'].includes(value);
    }

    private isValidRange(value: string): value is AdminRangeFilter {
        return ['7d', '30d', '90d', 'ytd'].includes(value);
    }
}
