export type AdminTrendDirection = 'up' | 'down';
export type AdminReportScope = 'global' | 'marketplace' | 'direct';
export type AdminRangeFilter = '7d' | '30d' | '90d' | 'ytd';

export interface AdminDashboardFilters {
    scope?: AdminReportScope;
    range?: AdminRangeFilter;
}

export interface AdminKpiCard {
    title: string;
    value: number;
    change: number;
    helper: string;
    trend: AdminTrendDirection;
    icon: 'sales' | 'bookings' | 'users' | 'revenue' | 'programs';
    accent?: 'dark';
}

export interface AdminTrendSeries {
    categories: string[];
    values: number[];
}

export interface AdminDualSeries {
    categories: string[];
    primary: number[];
    secondary: number[];
    primaryLabel: string;
    secondaryLabel: string;
}

export interface AdminStackedSeries {
    categories: string[];
    series: Array<{ name: string; data: number[] }>;
}

export interface AdminCategorySeries {
    labels: string[];
    values: number[];
}

export interface AdminHeatmapPoint {
    label: string;
    value: number;
}

export interface AdminHeatmapDay {
    day: string;
    slots: AdminHeatmapPoint[];
}

export interface AdminLeaderboardEntry {
    name: string;
    value: number;
    helper: string;
    percent: number;
}

export interface AdminActivityUser {
    name: string;
    sessions: number;
    streak: number;
}

export interface AdminPurchasingUser {
    name: string;
    spend: number;
    programs: number;
}

export interface AdminScatterPoint {
    sessions: number;
    spend: number;
}

export interface AdminPeopleSnapshot {
    trainerLeaderboard: AdminLeaderboardEntry[];
    activityLeaders: AdminActivityUser[];
    purchasingLeaders: AdminPurchasingUser[];
    activityVsSpend: AdminScatterPoint[];
}

export interface AdminSalesSnapshot {
    monthlyTrend: AdminTrendSeries;
    totalsVsProjection: AdminDualSeries;
    programSales: AdminCategorySeries;
    categoryMix: AdminCategorySeries;
}

export interface AdminBookingSnapshot {
    heatmap: AdminHeatmapDay[];
    volume: AdminDualSeries;
    funnel: AdminCategorySeries;
}

export interface AdminRevenueSnapshot {
    splitByQuarter: AdminStackedSeries;
    perTrainer: AdminStackedSeries;
    byCategory: AdminCategorySeries;
}

export interface AdminProgramSnapshot {
    status: AdminCategorySeries;
    perTrainer: AdminCategorySeries;
    popularity: AdminCategorySeries;
    categoryContribution: AdminCategorySeries;
}

export interface AdminDashboardSnapshot {
    generatedAt: string;
    kpis: AdminKpiCard[];
    sales: AdminSalesSnapshot;
    bookings: AdminBookingSnapshot;
    revenue: AdminRevenueSnapshot;
    programs: AdminProgramSnapshot;
    people: AdminPeopleSnapshot;
}
