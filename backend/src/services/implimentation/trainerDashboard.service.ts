import { inject, injectable } from 'inversify';
import { ITrainerDashboardService } from '../interface/trainerDashboard.service.interface';
import {
    BookingDemandSeries,
    RevenueTrendSeries,
    SessionSeries,
    TrainerBookingFilter,
    TrainerDashboardSnapshot,
    TrainerKpiCard,
    TrainerRevenueFilter,
    TrainerSessionFilter,
    TrainerSnapshotTotals,
} from '../../interfaces/dashboard.interface';
import { TYPES } from '../../shared/types/inversify.types';
import { IPaymentRepository } from '../../repositories/interface/payment.repostitory.interface';
import { IBookingRepository } from '../../repositories/interface/booking.repository.interface';
import { IProgramRepository } from '../../repositories/interface/program.repository.interface';
import { IPayment } from '../../models/payment.model';
import { IBooking } from '../../models/booking.model';
import { IProgram } from '../../models/program.model';

interface TrainerSessionAggregate {
    day?: string;
    date?: string;
    capacity?: number;
    bookedCount?: number;
}

@injectable()
export class TrainerDashboardService implements ITrainerDashboardService {
    constructor(
        @inject(TYPES.PaymentRepository)
        private readonly _paymentRepository: IPaymentRepository,
        @inject(TYPES.BookingRepository)
        private readonly _bookingRepository: IBookingRepository,
        @inject(TYPES.ProgramRespository)
        private readonly _programRepository: IProgramRepository,
    ) { }

    async getSnapshot(trainerId: string): Promise<TrainerDashboardSnapshot> {
        const [payments, sessionAggregates, bookingRecords, programs] = await Promise.all([
            this._paymentRepository.getProgramsByTrainerId(trainerId),
            this._bookingRepository.getTrainerBookings(trainerId),
            this._bookingRepository.getTrainerBookingRecords(trainerId),
            this._programRepository.getPrograms(trainerId),
        ]);

        const totals = this.buildTotals(payments, sessionAggregates, programs, bookingRecords);
        const revenueTrend = this.buildRevenueTrend(payments);
        const sessions = this.buildSessions(sessionAggregates, bookingRecords);
        const bookings = this.buildBookings(sessionAggregates, bookingRecords);
        const programsSnapshot = this.buildProgramSnapshot(programs, payments, bookingRecords);
        const clients = this.buildClientsSnapshot(bookingRecords);

        return {
            totals,
            kpis: this.buildKpis(totals, revenueTrend['3m']),
            revenue: { trend: revenueTrend },
            sessions,
            bookings,
            programs: programsSnapshot,
            clients,
        };
    }

    private buildTotals(
        payments: IPayment[],
        sessionAggregates: TrainerSessionAggregate[],
        programs: IProgram[],
        bookingRecords: IBooking[],
    ): TrainerSnapshotTotals {
        const successfulPayments = payments.filter((payment) => payment.paymentStatus === 'success');
        const totalEarnings = successfulPayments.reduce((sum, payment) => sum + (payment.trainerEarning ?? 0), 0);

        const activeClients = new Set(
            bookingRecords
                .map((booking) => booking.userId)
                .filter(Boolean)
                .map((user: any) => (typeof user === 'string' ? user : user._id?.toString()))
                .filter(Boolean) as string[],
        ).size;

        const livePrograms = programs.filter((program) => program.status !== 'inactive').length;

        const totalCapacity = sessionAggregates.reduce((sum, session) => sum + (session.capacity ?? 0), 0);
        const totalBooked = sessionAggregates.reduce((sum, session) => sum + (session.bookedCount ?? 0), 0);
        const sessionUtilization = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

        return {
            totalEarnings,
            activeClients,
            livePrograms,
            sessionUtilization,
        };
    }

    private buildKpis(totals: TrainerSnapshotTotals, revenue3m: RevenueTrendSeries): TrainerKpiCard[] {
        const monthlyRevenue = revenue3m.data[revenue3m.data.length - 1] ?? 0;
        const previousRevenue = revenue3m.data[revenue3m.data.length - 2] ?? monthlyRevenue;
        const revenueChange = previousRevenue === 0 ? 0 : Math.round(((monthlyRevenue - previousRevenue) / previousRevenue) * 100);

        return [
            {
                label: 'Monthly Revenue',
                value: this.formatCurrency(monthlyRevenue * 1000),
                change: revenueChange,
                helper: 'vs last month',
                icon: '₹',
                trend: revenueChange >= 0 ? 'up' : 'down',
            },
            {
                label: 'Active Clients',
                value: totals.activeClients.toString(),
                change: 8,
                helper: 'training this week',
                icon: '👥',
                trend: 'up',
            },
            {
                label: 'Programs Live',
                value: totals.livePrograms.toString(),
                change: 3,
                helper: 'with spots available',
                icon: '📦',
                trend: 'up',
            },
            {
                label: 'Session Utilization',
                value: `${totals.sessionUtilization}%`,
                change: totals.sessionUtilization - 80,
                helper: 'booked vs planned',
                icon: '🕒',
                trend: totals.sessionUtilization >= 80 ? 'up' : 'down',
            },
        ];
    }

    private buildRevenueTrend(payments: IPayment[]): Record<TrainerRevenueFilter, RevenueTrendSeries> {
        const monthlyTotals = new Map<string, number>();
        const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

        payments
            .filter((payment) => payment.paymentStatus === 'success')
            .forEach((payment) => {
                const date = payment.createdAt ? new Date(payment.createdAt) : new Date();
                const key = `${date.getFullYear()}-${date.getMonth()}`;
                monthlyTotals.set(key, (monthlyTotals.get(key) ?? 0) + (payment.trainerEarning ?? 0));
            });

        const buildSeries = (months: number): RevenueTrendSeries => {
            const categories: string[] = [];
            const data: number[] = [];
            const now = new Date();

            for (let i = months - 1; i >= 0; i -= 1) {
                const iterDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${iterDate.getFullYear()}-${iterDate.getMonth()}`;
                const total = monthlyTotals.get(key) ?? 0;
                categories.push(formatter.format(iterDate));
                data.push(Math.round(total / 1000));
            }
            return { categories, data };
        };

        return {
            '3m': buildSeries(3),
            '6m': buildSeries(6),
            '12m': buildSeries(12),
        };
    }

    private buildSessions(
        sessionAggregates: TrainerSessionAggregate[],
        bookingRecords: IBooking[],
    ): Record<TrainerSessionFilter, SessionSeries> {
        const weekCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekCompleted = new Array(7).fill(0);
        const weekScheduled = new Array(7).fill(0);
        const dayIndex: Record<string, number> = {
            mon: 0,
            tue: 1,
            wed: 2,
            thu: 3,
            fri: 4,
            sat: 5,
            sun: 6,
        };

        sessionAggregates.forEach((session) => {
            const idx = dayIndex[(session.day ?? '').slice(0, 3).toLowerCase()] ?? 0;
            weekCompleted[idx] += session.bookedCount ?? 0;
            weekScheduled[idx] += session.capacity ?? session.bookedCount ?? 0;
        });

        const weekSeries: SessionSeries = {
            categories: weekCategories,
            completed: weekCompleted,
            scheduled: weekScheduled,
        };

        const weekGroups = [0, 0, 0, 0];
        const weekGroupsCompleted = [0, 0, 0, 0];
        bookingRecords.forEach((booking) => {
            const date = booking.snapshot?.slotDate ? new Date(booking.snapshot.slotDate) : new Date();
            const weekOfMonth = Math.min(3, Math.floor((date.getDate() - 1) / 7));
            weekGroups[weekOfMonth] += 1;
            weekGroupsCompleted[weekOfMonth] += booking.status === 'completed' ? 1 : 0;
        });

        const monthSeries: SessionSeries = {
            categories: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
            completed: weekGroupsCompleted,
            scheduled: weekGroups,
        };

        return {
            week: weekSeries,
            month: monthSeries,
        };
    }

    private buildBookings(
        sessionAggregates: TrainerSessionAggregate[],
        bookingRecords: IBooking[],
    ): {
        demand: Record<TrainerBookingFilter, BookingDemandSeries>;
        conversion: { labels: string[]; series: number[] };
    } {
        const weekCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekRequests = new Array(7).fill(0);
        const weekConfirmed = new Array(7).fill(0);
        const dayIndex: Record<string, number> = {
            mon: 0,
            tue: 1,
            wed: 2,
            thu: 3,
            fri: 4,
            sat: 5,
            sun: 6,
        };

        sessionAggregates.forEach((session) => {
            const idx = dayIndex[(session.day ?? '').slice(0, 3).toLowerCase()] ?? 0;
            weekRequests[idx] += session.capacity ?? session.bookedCount ?? 0;
            weekConfirmed[idx] += session.bookedCount ?? 0;
        });

        const buildWeekSeries = (): BookingDemandSeries => ({
            categories: weekCategories,
            requests: weekRequests,
            confirmed: weekConfirmed,
        });

        const buildMonthSeries = (): BookingDemandSeries => ({
            categories: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
            requests: this.chunkAndSum(weekRequests, 4),
            confirmed: this.chunkAndSum(weekConfirmed, 4),
        });

        const buildQuarterSeries = (): BookingDemandSeries => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
            const categories: string[] = [];
            const requests: number[] = [];
            const confirmed: number[] = [];

            for (let i = 2; i >= 0; i -= 1) {
                const iterDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthPayments = bookingRecords.filter((booking) => {
                    const d = booking.snapshot?.slotDate ? new Date(booking.snapshot.slotDate) : new Date();
                    return d.getFullYear() === iterDate.getFullYear() && d.getMonth() === iterDate.getMonth();
                });
                categories.push(formatter.format(iterDate));
                requests.push(monthPayments.length);
                confirmed.push(monthPayments.filter((booking) => booking.status !== 'cancelled').length);
            }

            return { categories, requests, confirmed };
        };

        const conversionMap = bookingRecords.reduce(
            (acc, booking) => {
                const status = booking.status ?? 'booked';
                acc[status] = (acc[status] ?? 0) + 1;
                return acc;
            },
            {} as Record<string, number>,
        );

        const totalBookings = Object.values(conversionMap).reduce((sum, count) => sum + count, 0) || 1;
        const labels = ['booked', 'completed', 'cancelled'];
        const series = labels.map((label) => Math.round(((conversionMap[label] ?? 0) / totalBookings) * 100));

        return {
            demand: {
                week: buildWeekSeries(),
                month: buildMonthSeries(),
                quarter: buildQuarterSeries(),
            },
            conversion: {
                labels: ['Confirmed', 'Completed', 'Cancelled'],
                series,
            },
        };
    }

    private buildProgramSnapshot(
        programs: IProgram[],
        payments: IPayment[],
        bookingRecords: IBooking[],
    ): {
        performance: { labels: string[]; series: number[] };
    } {
        const revenueByProgram = new Map<string, number>();
        const nameByProgram = new Map<string, string>();

        programs.forEach((program) => {
            const id = program._id?.toString() ?? program.programId;
            if (id) {
                nameByProgram.set(id, program.title);
            }
        });

        payments.forEach((payment) => {
            const programId = (payment.programId as any)?.toString?.() ?? payment.programId?.toString?.() ?? '';
            if (!programId) {
                return;
            }
            if (!nameByProgram.has(programId) && payment.programName) {
                nameByProgram.set(programId, payment.programName);
            }
            if (payment.paymentStatus !== 'success') {
                return;
            }
            revenueByProgram.set(programId, (revenueByProgram.get(programId) ?? 0) + (payment.trainerEarning ?? 0));
        });

        if (revenueByProgram.size === 0) {
            bookingRecords.forEach((booking) => {
                const programId = booking.snapshot?.programId?.toString();
                if (!programId) {
                    return;
                }
                const title = booking.snapshot?.programTitle ?? 'Program';
                nameByProgram.set(programId, title);
                revenueByProgram.set(programId, (revenueByProgram.get(programId) ?? 0) + 1);
            });
        }

        const entries = Array.from(revenueByProgram.entries())
            .map(([programId, value]) => ({ label: nameByProgram.get(programId) ?? 'Program', value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const labels = entries.map((entry) => entry.label);
        const series = entries.map((entry) => Math.round(entry.value));

        return {
            performance: {
                labels,
                series,
            },
        };
    }

    private buildClientsSnapshot(bookingRecords: IBooking[]): {
        leaderboard: Array<{ name: string; sessions: number; focus: string; completion: number }>;
        goalTrend: { categories: string[]; data: number[] };
    } {
        const clientMap = new Map<string, { name: string; sessions: number }>();

        bookingRecords.forEach((booking) => {
            const user = booking.userId as any;
            const id = typeof user === 'string' ? user : user?._id?.toString();
            if (!id) {
                return;
            }
            const name = typeof user === 'string' ? 'Client' : user.fullName ?? user.email ?? 'Client';
            const entry = clientMap.get(id) ?? { name, sessions: 0 };
            entry.sessions += 1;
            clientMap.set(id, entry);
        });

        const leaderboard = Array.from(clientMap.values())
            .sort((a, b) => b.sessions - a.sessions)
            .slice(0, 4)
            .map((client) => ({
                name: client.name,
                sessions: client.sessions,
                focus: 'Personalized Program',
                completion: Math.min(100, 60 + client.sessions * 5),
            }));

        const goalCategories = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
        const goalData = goalCategories.map((_, index) => {
            const window = bookingRecords.filter((booking) => {
                const date = booking.snapshot?.slotDate ? new Date(booking.snapshot.slotDate) : new Date();
                const now = new Date();
                const diffWeeks = Math.floor((now.getTime() - date.getTime()) / (7 * 24 * 60 * 60 * 1000));
                return diffWeeks === index;
            });
            if (window.length === 0) {
                return Math.max(50, 90 - index * 5);
            }
            const completed = window.filter((booking) => booking.status === 'completed').length;
            return Math.round((completed / window.length) * 100);
        });

        return {
            leaderboard,
            goalTrend: {
                categories: goalCategories,
                data: goalData,
            },
        };
    }

    private formatCurrency(value: number): string {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(1)}L`;
        }
        if (value >= 1000) {
            return `₹${(value / 1000).toFixed(1)}k`;
        }
        return `₹${value.toFixed(0)}`;
    }

    private chunkAndSum(values: number[], chunks: number): number[] {
        const chunkSize = Math.ceil(values.length / chunks);
        const result: number[] = new Array(chunks).fill(0);
        values.forEach((value, index) => {
            const bucket = Math.min(chunks - 1, Math.floor(index / chunkSize));
            result[bucket] += value;
        });
        return result;
    }
}
