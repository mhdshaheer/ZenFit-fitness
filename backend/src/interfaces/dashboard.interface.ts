import { IProgram } from '../models/program.model';
import { IPayment } from '../models/payment.model';

export type TrainerRevenueFilter = '3m' | '6m' | '12m';
export type TrainerSessionFilter = 'week' | 'month';
export type TrainerBookingFilter = 'week' | 'month' | 'quarter';

export interface TrainerKpiCard {
    label: string;
    value: string;
    change: number;
    helper: string;
    icon: string;
    trend: 'up' | 'down';
}

export interface RevenueTrendSeries {
    categories: string[];
    data: number[];
}

export interface SessionSeries {
    categories: string[];
    completed: number[];
    scheduled: number[];
}

export interface BookingDemandSeries {
    categories: string[];
    requests: number[];
    confirmed: number[];
}

export interface TrainerDashboardSnapshot {
    totals: TrainerSnapshotTotals;
    kpis: TrainerKpiCard[];
    revenue: {
        trend: Record<TrainerRevenueFilter, RevenueTrendSeries>;
    };
    sessions: Record<TrainerSessionFilter, SessionSeries>;
    bookings: {
        demand: Record<TrainerBookingFilter, BookingDemandSeries>;
        conversion: { labels: string[]; series: number[] };
    };
    programs: {
        performance: { labels: string[]; series: number[] };
    };
    clients: {
        leaderboard: Array<{ name: string; sessions: number; focus: string; completion: number }>;
        goalTrend: { categories: string[]; data: number[] };
    };
}

export interface TrainerSnapshotTotals {
    totalEarnings: number;
    activeClients: number;
    livePrograms: number;
    sessionUtilization: number;
}

export interface PaymentSummary extends Pick<IPayment, 'trainerEarning' | 'amount' | 'paymentStatus'> {
    createdAt?: Date;
    programId?: any;
    programName?: string;
}

export interface SessionSummary {
    date: Date;
    capacity: number;
    bookedCount: number;
    programName?: string;
    difficultyLevel?: string;
    students: Array<{ status?: string; name?: string; email?: string }>;
}

export type TrainerProgram = Pick<IProgram, 'title' | 'status' | 'createdAt' | 'id' | '_id'>;
