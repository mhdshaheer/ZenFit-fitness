import { inject, injectable } from 'inversify';
import { IAdminDashboardService } from '../interface/adminDashboard.service.interface';
import {
    AdminActivityUser,
    AdminBookingSnapshot,
    AdminCategorySeries,
    AdminDashboardFilters,
    AdminDashboardSnapshot,
    AdminHeatmapDay,
    AdminKpiCard,
    AdminPeopleSnapshot,
    AdminProgramSnapshot,
    AdminPurchasingUser,
    AdminRangeFilter,
    AdminReportScope,
    AdminRevenueSnapshot,
    AdminSalesSnapshot,
    AdminTrendSeries,
    AdminScatterPoint,
} from '../../interfaces/adminDashboard.interface';
import { TYPES } from '../../shared/types/inversify.types';
import { IPaymentRepository } from '../../repositories/interface/payment.repostitory.interface';
import { IBookingRepository } from '../../repositories/interface/booking.repository.interface';
import { IProgramRepository } from '../../repositories/interface/program.repository.interface';
import { IUserRepository } from '../../repositories/interface/user.repository.interface';
import { IPayment } from '../../models/payment.model';
import { IBooking } from '../../models/booking.model';
import { IProgram } from '../../models/program.model';
import { IUser } from '../../interfaces/user.interface';

interface RevenueSplit {
    admin: number;
    trainer: number;
}

@injectable()
export class AdminDashboardService implements IAdminDashboardService {
    constructor(
        @inject(TYPES.PaymentRepository)
        private readonly paymentRepository: IPaymentRepository,
        @inject(TYPES.BookingRepository)
        private readonly bookingRepository: IBookingRepository,
        @inject(TYPES.ProgramRespository)
        private readonly programRepository: IProgramRepository,
        @inject(TYPES.UserRepository)
        private readonly userRepository: IUserRepository,
    ) { }

    async getSnapshot(filters?: AdminDashboardFilters): Promise<AdminDashboardSnapshot> {
        const scope = filters?.scope ?? 'global';
        const range = filters?.range;

        const [payments, bookings, programs, users] = await Promise.all([
            this.paymentRepository.getPayments(),
            this.bookingRepository.getAllBookings(),
            this.programRepository.getAllPrograms(),
            this.userRepository.findAll(),
        ]);

        const startDate = range ? this.resolveStartDate(range) : undefined;

        const rangedPayments = this.filterPaymentsByRange(payments, startDate);
        const rangedBookings = this.filterBookingsByRange(bookings, startDate);
        const rangedPrograms = this.filterProgramsByRange(programs, startDate);

        const { payments: scopedPayments, bookings: scopedBookings, programs: scopedPrograms } = this.applyScopeFilters(
            rangedPayments,
            rangedBookings,
            rangedPrograms,
            users,
            scope,
        );

        return {
            generatedAt: new Date().toISOString(),
            kpis: this.buildKpis(scopedPayments, scopedBookings, scopedPrograms, users),
            sales: this.buildSalesSnapshot(scopedPayments, scopedPrograms),
            bookings: this.buildBookingSnapshot(scopedBookings),
            revenue: this.buildRevenueSnapshot(scopedPayments, users, scopedPrograms),
            programs: this.buildProgramSnapshot(scopedPrograms, scopedBookings, scopedPayments),
            people: this.buildPeopleSnapshot(scopedPayments, scopedBookings, users),
        };
    }

    private buildKpis(
        payments: IPayment[],
        bookings: IBooking[],
        programs: IProgram[],
        users: IUser[],
    ): AdminKpiCard[] {
        const successfulPayments = payments.filter((payment) => payment.paymentStatus === 'success');
        const monthlyTrend = this.buildMonthlyTrend(successfulPayments, 2);
        const currentMonth = monthlyTrend.values.at(-1) ?? 0;
        const lastMonth = monthlyTrend.values.at(-2) ?? currentMonth;

        const totalSales = successfulPayments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
        const totalRevenue = successfulPayments.reduce((sum, payment) => sum + (payment.platformFee ?? 0), 0);
        const activeUsers = users.filter((user) => user.role === 'user' && user.status === 'active').length;
        const approvedPrograms = programs.filter((program) => program.status === 'active').length;

        return [
            {
                title: 'Total Sales',
                value: totalSales,
                change: this.calculateChange(currentMonth, lastMonth),
                helper: 'vs last month',
                trend: currentMonth >= lastMonth ? 'up' : 'down',
                icon: 'sales',
                accent: 'dark',
            },
            {
                title: 'Total Bookings',
                value: bookings.length,
                change: this.calculateChange(bookings.length, Math.max(bookings.length - 20, 1)),
                helper: 'lifetime completed',
                trend: 'up',
                icon: 'bookings',
            },
            {
                title: 'Active Users',
                value: activeUsers,
                change: this.calculateChange(activeUsers, Math.max(users.length - activeUsers, 1)),
                helper: 'actively training',
                trend: 'up',
                icon: 'users',
            },
            {
                title: 'Platform Revenue',
                value: totalRevenue,
                change: this.calculateChange(totalRevenue, Math.max(totalSales - totalRevenue, 1)),
                helper: 'net of trainer payouts',
                trend: totalRevenue >= 0 ? 'up' : 'down',
                icon: 'revenue',
            },
            {
                title: 'Approved Programs',
                value: approvedPrograms,
                change: this.calculateChange(approvedPrograms, programs.length || 1),
                helper: `${programs.length - approvedPrograms} pending`,
                trend: 'up',
                icon: 'programs',
            },
        ];
    }

    private buildSalesSnapshot(payments: IPayment[], programs: IProgram[]): AdminSalesSnapshot {
        const monthlyTrend = this.buildMonthlyTrend(payments, 12);
        return {
            monthlyTrend,
            totalsVsProjection: {
                categories: monthlyTrend.categories,
                primary: monthlyTrend.values,
                secondary: monthlyTrend.values.map((value) => Math.round(value * 1.08)),
                primaryLabel: 'Actual',
                secondaryLabel: 'Projection',
            },
            programSales: this.buildProgramSales(payments),
            categoryMix: this.buildCategoryMix(programs),
        };
    }

    private buildBookingSnapshot(bookings: IBooking[]): AdminBookingSnapshot {
        const completed = bookings.filter((booking) => booking.status === 'completed' || booking.status === 'booked').length;
        const cancelled = bookings.filter((booking) => booking.status === 'cancelled').length;
        const pending = bookings.length - completed - cancelled;

        return {
            heatmap: this.buildBookingHeatmap(bookings),
            volume: this.buildBookingVolume(bookings),
            funnel: {
                labels: ['Completed', 'Cancelled', 'Pending'],
                values: [completed, cancelled, Math.max(pending, 0)],
            },
        };
    }

    private buildRevenueSnapshot(
        payments: IPayment[],
        users: IUser[],
        programs: IProgram[],
    ): AdminRevenueSnapshot {
        const byQuarter = this.groupByQuarter(payments);
        const ladder = this.aggregateTrainerRevenue(payments, users).slice(0, 5);

        return {
            splitByQuarter: {
                categories: Object.keys(byQuarter),
                series: [
                    { name: 'Admin', data: Object.values(byQuarter).map((bucket) => this.toLakhs(bucket.admin)) },
                    { name: 'Trainer', data: Object.values(byQuarter).map((bucket) => this.toLakhs(bucket.trainer)) },
                ],
            },
            perTrainer: {
                categories: ladder.map((entry) => entry.name),
                series: [{ name: 'Programs', data: ladder.map((entry) => this.toLakhs(entry.value)) }],
            },
            byCategory: this.buildRevenueByCategory(payments, programs),
        };
    }

    private buildProgramSnapshot(
        programs: IProgram[],
        bookings: IBooking[],
        payments: IPayment[],
    ): AdminProgramSnapshot {
        return {
            status: {
                labels: ['Active', 'Inactive', 'Draft'],
                values: [
                    programs.filter((program) => program.status === 'active').length,
                    programs.filter((program) => program.status === 'inactive').length,
                    programs.filter((program) => program.status === 'draft').length,
                ],
            },
            perTrainer: this.buildProgramsPerTrainer(programs),
            popularity: this.buildProgramPopularity(bookings, programs),
            categoryContribution: this.buildRevenueByCategory(payments, programs),
        };
    }

    private buildPeopleSnapshot(
        payments: IPayment[],
        bookings: IBooking[],
        users: IUser[],
    ): AdminPeopleSnapshot {
        const leaderboard = this.aggregateTrainerRevenue(payments, users).slice(0, 5).map((entry, index) => ({
            name: entry.name,
            value: entry.value,
            helper: `${entry.programs} programs • ₹${entry.value.toLocaleString('en-IN')}`,
            percent: Math.max(30, 100 - index * 12),
        }));

        return {
            trainerLeaderboard: leaderboard,
            activityLeaders: this.buildActivityLeaders(bookings, users),
            purchasingLeaders: this.buildPurchasingLeaders(payments, users),
            activityVsSpend: this.buildActivityVsSpend(bookings, payments),
        };
    }

    private buildMonthlyTrend(payments: IPayment[], months: number): AdminTrendSeries {
        const now = new Date();
        const buckets: { label: string; total: number }[] = [];

        for (let index = months - 1; index >= 0; index -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
            const label = date.toLocaleString('en', { month: 'short' });
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const total = payments
                .filter((payment) => this.matchesMonth(payment.createdAt, key))
                .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);

            buckets.push({ label, total });
        }

        return {
            categories: buckets.map((bucket) => bucket.label),
            values: buckets.map((bucket) => this.toLakhs(bucket.total)),
        };
    }

    private buildProgramSales(payments: IPayment[]): AdminCategorySeries {
        const grouped = payments.reduce<Record<string, number>>((acc, payment) => {
            const label = payment.programName ?? 'Program';
            acc[label] = (acc[label] ?? 0) + (payment.amount ?? 0);
            return acc;
        }, {});

        const top = Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        return {
            labels: top.map(([label]) => label),
            values: top.map(([, value]) => this.toLakhs(value)),
        };
    }

    private buildCategoryMix(programs: IProgram[]): AdminCategorySeries {
        const grouped = programs.reduce<Record<string, number>>((acc, program) => {
            const category = typeof program.category === 'object' && program.category !== null
                ? (program.category as any).name ?? 'Uncategorized'
                : program.category ?? 'Uncategorized';
            acc[category] = (acc[category] ?? 0) + 1;
            return acc;
        }, {});

        const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return {
            labels: sorted.map(([label]) => label),
            values: sorted.map(([, value]) => value),
        };
    }

    private buildRevenueByCategory(payments: IPayment[], programs: IProgram[]): AdminCategorySeries {
        const programMap = new Map<string, IProgram>();
        programs.forEach((program) => {
            if (program._id) {
                programMap.set(program._id.toString(), program);
            }
        });

        const grouped = payments.reduce<Record<string, number>>((acc, payment) => {
            const program = programMap.get(payment.programId?.toString() ?? '');
            const category = program && typeof program.category === 'object' && program.category !== null
                ? (program.category as any).name ?? 'Uncategorized'
                : 'Uncategorized';
            acc[category] = (acc[category] ?? 0) + (payment.amount ?? 0);
            return acc;
        }, {});

        const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return {
            labels: sorted.map(([label]) => label),
            values: sorted.map(([, value]) => this.toLakhs(value)),
        };
    }

    private buildBookingHeatmap(bookings: IBooking[]): AdminHeatmapDay[] {
        const buckets = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM'];
        const dayMap = new Map<string, Map<string, number>>();

        bookings.forEach((booking) => {
            const day = booking.day ?? new Date(booking.snapshot.slotDate).toLocaleDateString('en', { weekday: 'short' });
            const slot = this.bucketize(booking.snapshot.startTime ?? '06:00', buckets);
            if (!dayMap.has(day)) {
                dayMap.set(day, new Map());
            }
            const row = dayMap.get(day)!;
            row.set(slot, (row.get(slot) ?? 0) + 1);
        });

        return Array.from(dayMap.entries()).map(([day, row]) => ({
            day,
            slots: buckets.map((label) => ({ label, value: row.get(label) ?? 0 })),
        }));
    }

    private buildBookingVolume(bookings: IBooking[]) {
        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        const counts = weeks.map((_, index) => {
            const start = new Date();
            start.setDate(start.getDate() - (index + 1) * 7);
            const end = new Date(start);
            end.setDate(start.getDate() + 7);
            return bookings.filter((booking) => {
                const date = new Date(booking.snapshot.slotDate);
                return date >= start && date < end;
            }).length;
        }).reverse();

        return {
            categories: weeks,
            primary: counts,
            secondary: counts.map((value) => Math.round(value * 4)),
            primaryLabel: 'Weekly',
            secondaryLabel: 'Monthly',
        };
    }

    private buildProgramsPerTrainer(programs: IProgram[]): AdminCategorySeries {
        const grouped = programs.reduce<Record<string, number>>((acc, program) => {
            const trainerId = typeof program.trainerId === 'string' ? program.trainerId : program.trainerId?.toString() ?? 'Trainer';
            acc[trainerId] = (acc[trainerId] ?? 0) + 1;
            return acc;
        }, {});

        const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return {
            labels: sorted.map(([label]) => label),
            values: sorted.map(([, value]) => value),
        };
    }

    private buildProgramPopularity(bookings: IBooking[], programs: IProgram[]): AdminCategorySeries {
        const programMap = new Map<string, string>();
        programs.forEach((program) => {
            if (program._id) {
                programMap.set(program._id.toString(), program.title);
            }
        });

        const grouped = bookings.reduce<Record<string, number>>((acc, booking) => {
            const key = booking.snapshot.programId?.toString() ?? 'program';
            const title = programMap.get(key) ?? booking.snapshot.programTitle ?? 'Program';
            acc[title] = (acc[title] ?? 0) + 1;
            return acc;
        }, {});

        const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return {
            labels: sorted.map(([label]) => label),
            values: sorted.map(([, value]) => value),
        };
    }

    private groupByQuarter(payments: IPayment[]): Record<string, RevenueSplit> {
        return payments.reduce<Record<string, RevenueSplit>>((acc, payment) => {
            const date = new Date(payment.createdAt ?? new Date());
            const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
            if (!acc[quarter]) {
                acc[quarter] = { admin: 0, trainer: 0 };
            }
            acc[quarter].admin += payment.platformFee ?? 0;
            acc[quarter].trainer += payment.trainerEarning ?? 0;
            return acc;
        }, {});
    }

    private aggregateTrainerRevenue(payments: IPayment[], users: IUser[]) {
        const trainerMap = new Map<string, { name: string; value: number; programs: number }>();

        payments.forEach((payment) => {
            const trainerId = payment.trainerId?.toString();
            if (!trainerId) {
                return;
            }
            const user = users.find((candidate) => candidate._id?.toString() === trainerId);
            if (!trainerMap.has(trainerId)) {
                trainerMap.set(trainerId, {
                    name: user?.fullName || user?.username || 'Trainer',
                    value: 0,
                    programs: 0,
                });
            }
            const entry = trainerMap.get(trainerId)!;
            entry.value += payment.trainerEarning ?? 0;
            entry.programs += 1;
        });

        return Array.from(trainerMap.values()).sort((a, b) => b.value - a.value);
    }

    private buildActivityLeaders(bookings: IBooking[], users: IUser[]): AdminActivityUser[] {
        const grouped = bookings.reduce<Record<string, number>>((acc, booking) => {
            const userId = booking.userId?.toString();
            if (!userId) {
                return acc;
            }
            acc[userId] = (acc[userId] ?? 0) + 1;
            return acc;
        }, {});

        return Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([userId, sessions]) => {
                const user = users.find((candidate) => candidate._id?.toString() === userId);
                return {
                    name: user?.fullName || user?.username || 'Member',
                    sessions,
                    streak: Math.max(1, Math.round(sessions / 2)),
                };
            });
    }

    private buildPurchasingLeaders(payments: IPayment[], users: IUser[]): AdminPurchasingUser[] {
        const grouped = payments.reduce<Record<string, number>>((acc, payment) => {
            const userId = payment.userId?.toString();
            if (!userId) {
                return acc;
            }
            acc[userId] = (acc[userId] ?? 0) + (payment.amount ?? 0);
            return acc;
        }, {});

        return Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([userId, spend]) => {
                const user = users.find((candidate) => candidate._id?.toString() === userId);
                return {
                    name: user?.fullName || user?.username || 'Member',
                    spend,
                    programs: payments.filter((payment) => payment.userId?.toString() === userId).length,
                };
            });
    }

    private buildActivityVsSpend(bookings: IBooking[], payments: IPayment[]): AdminScatterPoint[] {
        return bookings.slice(0, 8).map((booking) => {
            const spend = payments
                .filter((payment) => payment.userId?.toString() === booking.userId?.toString())
                .reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
            return {
                sessions: Math.max(booking.snapshot.capacity ?? 1, 1),
                spend: this.toLakhs(spend),
            };
        });
    }

    private resolveStartDate(range: AdminRangeFilter): Date {
        const now = new Date();
        switch (range) {
            case '7d':
                now.setDate(now.getDate() - 7);
                break;
            case '30d':
                now.setDate(now.getDate() - 30);
                break;
            case '90d':
                now.setDate(now.getDate() - 90);
                break;
            case 'ytd':
                return new Date(now.getFullYear(), 0, 1);
        }
        return now;
    }

    private filterPaymentsByRange(payments: IPayment[], startDate?: Date): IPayment[] {
        if (!startDate) {
            return payments;
        }
        return payments.filter((payment) => this.isOnOrAfter(payment.createdAt, startDate));
    }

    private filterBookingsByRange(bookings: IBooking[], startDate?: Date): IBooking[] {
        if (!startDate) {
            return bookings;
        }
        return bookings.filter((booking) => {
            const bookingDate = booking.createdAt ?? booking.snapshot.slotDate ?? booking.date;
            return this.isOnOrAfter(bookingDate, startDate);
        });
    }

    private filterProgramsByRange(programs: IProgram[], startDate?: Date): IProgram[] {
        if (!startDate) {
            return programs;
        }
        return programs.filter((program) => this.isOnOrAfter(program.createdAt, startDate));
    }

    private applyScopeFilters(
        payments: IPayment[],
        bookings: IBooking[],
        programs: IProgram[],
        users: IUser[],
        scope: AdminReportScope,
    ) {
        if (scope === 'global') {
            return { payments, bookings, programs };
        }

        const roleMap = this.buildRoleMap(users);
        const shouldInclude = (trainerId?: string) => {
            const isMarketplaceTrainer = trainerId ? roleMap.get(trainerId) === 'trainer' : false;
            return scope === 'marketplace' ? isMarketplaceTrainer : !isMarketplaceTrainer;
        };

        return {
            payments: payments.filter((payment) => shouldInclude(this.toPlainId(payment.trainerId))),
            bookings: bookings.filter((booking) => shouldInclude(this.toPlainId(booking.snapshot?.trainerId))),
            programs: programs.filter((program) => shouldInclude(this.toPlainId(program.trainerId))),
        };
    }

    private buildRoleMap(users: IUser[]): Map<string, string | undefined> {
        const map = new Map<string, string | undefined>();
        users.forEach((user) => {
            if (user._id) {
                map.set(user._id.toString(), user.role);
            }
        });
        return map;
    }

    private toPlainId(value: string | { toString(): string } | undefined | null): string | undefined {
        if (!value) {
            return undefined;
        }
        if (typeof value === 'string') {
            return value;
        }
        return value.toString();
    }

    private isOnOrAfter(dateValue: Date | string | undefined | null, startDate?: Date): boolean {
        if (!startDate || !dateValue) {
            return true;
        }
        const candidate = new Date(dateValue);
        return candidate >= startDate;
    }

    private bucketize(time: string, buckets: string[]): string {
        const hour = Number(time.split(':')[0]);
        if (hour < 8) {
            return buckets[0];
        }
        if (hour < 11) {
            return buckets[1];
        }
        if (hour < 14) {
            return buckets[2];
        }
        if (hour < 17) {
            return buckets[3];
        }
        return buckets[4];
    }

    private matchesMonth(dateValue: Date | string | undefined, key: string): boolean {
        if (!dateValue) {
            return false;
        }
        const date = new Date(dateValue);
        return `${date.getFullYear()}-${date.getMonth()}` === key;
    }

    private calculateChange(current: number, previous: number): number {
        if (previous === 0) {
            return current ? 100 : 0;
        }
        return Math.round(((current - previous) / previous) * 100);
    }

    private toLakhs(value: number): number {
        return Math.round(value / 1000);
    }
}
