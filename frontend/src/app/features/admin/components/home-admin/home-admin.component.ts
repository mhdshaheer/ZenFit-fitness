import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { AdminService } from '../../../../core/services/admin.service';
import {
  AdminDashboardSnapshot,
  AdminRangeFilter,
  AdminReportScope,
} from '../../../../interface/admin-dashboard.interface';

type TrendDirection = 'up' | 'down';
type AnalyticsTab =
  | 'sales'
  | 'bookings'
  | 'revenue'
  | 'portfolio'
  | 'people';

interface KpiCard {
  title: string;
  value: string;
  change: number;
  helper: string;
  trend: TrendDirection;
  icon: 'sales' | 'bookings' | 'users' | 'revenue' | 'programs';
  accent?: 'dark';
}

interface LeaderboardEntry {
  name: string;
  value: string;
  helper: string;
  percent: number;
}

interface ActivityUser {
  name: string;
  sessions: number;
  streak: number;
}

interface PurchasingUser {
  name: string;
  spend: string;
  programs: number;
}

interface AnalyticsTabMeta {
  key: AnalyticsTab;
  label: string;
  helper: string;
}

interface TabFilterOption {
  key: string;
  label: string;
}

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
})
export class HomeAdminComponent implements OnInit {
  private readonly _adminService = inject(AdminService);

  readonly tabs: AnalyticsTabMeta[] = [
    { key: 'sales', label: 'Sales & revenue', helper: 'Commerce + earnings signal' },
    { key: 'bookings', label: 'Booking analytics', helper: 'Utilization watch' },
    { key: 'portfolio', label: 'Programs & categories', helper: 'Approvals + discipline mix' },
    { key: 'people', label: 'Trainer & user analytics', helper: 'Leaders & cohorts' },
  ];

  activeTab: AnalyticsTab = 'sales';
  readonly tabFilters: Record<AnalyticsTab, TabFilterOption[]> = {
    sales: [
      { key: '7d', label: '7d' },
      { key: '30d', label: '30d' },
      { key: '90d', label: '90d' },
    ],
    bookings: [
      { key: 'weekly', label: 'Weekly' },
      { key: 'monthly', label: 'Monthly' },
      { key: 'quarterly', label: 'Quarterly' },
    ],
    revenue: [
      { key: 'q1', label: 'Q1' },
      { key: 'q2', label: 'Q2' },
      { key: 'q3', label: 'Q3' },
      { key: 'q4', label: 'Q4' },
    ],
    portfolio: [
      { key: 'all', label: 'All' },
      { key: 'programs', label: 'Programs' },
      { key: 'categories', label: 'Categories' },
    ],
    people: [
      { key: 'trainer', label: 'Trainer' },
      { key: 'user', label: 'User' },
      { key: 'cohort', label: 'Cohort' },
    ],
  };

  activeTabFilters: Record<AnalyticsTab, string> = {
    sales: '7d',
    bookings: 'weekly',
    revenue: 'q1',
    portfolio: 'all',
    people: 'trainer',
  };

  readonly reportFilters: TabFilterOption[] = [
    { key: 'global', label: 'Global overview' },
    { key: 'marketplace', label: 'Marketplace only' },
    { key: 'direct', label: 'Direct trainers' },
  ];

  readonly reportDateRanges: TabFilterOption[] = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' },
    { key: 'ytd', label: 'Year to date' },
  ];

  selectedReportFilter = this.reportFilters[0].key;
  activeDateRange = this.reportDateRanges[1].key;

  kpiCards: KpiCard[] = [
    {
      title: 'Total Sales',
      value: '₹8.9L',
      change: 12.4,
      helper: 'vs last month',
      trend: 'up',
      icon: 'sales',
      accent: 'dark',
    },
    {
      title: 'Total Bookings',
      value: '2,348',
      change: 6.1,
      helper: 'completed this month',
      trend: 'up',
      icon: 'bookings',
    },
    {
      title: 'Active Users',
      value: '18,420',
      change: 3.5,
      helper: 'logged in this week',
      trend: 'up',
      icon: 'users',
    },
    {
      title: 'Total Revenue',
      value: '₹5.2L',
      change: 2.3,
      helper: 'net after trainer payout',
      trend: 'down',
      icon: 'revenue',
    },
    {
      title: 'Approved Programs',
      value: '142',
      change: 4.0,
      helper: '12 waiting review',
      trend: 'up',
      icon: 'programs',
    },
  ];

  trainerLeaderboard: LeaderboardEntry[] = [
    { name: 'Amit Rao', value: '₹1.4L', helper: 'HIIT Pro • 4.9★', percent: 82 },
    { name: 'Zara Mehta', value: '₹1.2L', helper: 'Pilates Core • 4.8★', percent: 74 },
    { name: 'Neel Patel', value: '₹98K', helper: 'Strength Lab • 4.7★', percent: 64 },
    { name: 'Riya Kapoor', value: '₹86K', helper: 'Mobility Reset • 4.9★', percent: 58 },
    { name: 'Kabir Khan', value: '₹79K', helper: 'Metcon Burn • 4.6★', percent: 52 },
  ];

  userActivityLeaders: ActivityUser[] = [
    { name: 'Sneha Kulkarni', sessions: 34, streak: 12 },
    { name: 'Rahul Verma', sessions: 28, streak: 9 },
    { name: 'Priya Shah', sessions: 25, streak: 8 },
    { name: 'Arjun Sethi', sessions: 22, streak: 7 },
  ];

  purchasingLeaders: PurchasingUser[] = [
    { name: 'Rohit Sharma', spend: '₹54K', programs: 12 },
    { name: 'Dia Sen', spend: '₹48K', programs: 10 },
    { name: 'Mohan Rao', spend: '₹42K', programs: 9 },
    { name: 'Ishita Jain', spend: '₹38K', programs: 8 },
  ];

  monthlySalesTrendChart: Partial<ApexOptions> = {};
  totalSalesAreaChart: Partial<ApexOptions> = {};
  programSalesBarChart: Partial<ApexOptions> = {};
  categorySalesDonutChart: Partial<ApexOptions> = {};
  bookingsHeatmapChart: Partial<ApexOptions> = {};
  bookingVolumeChart: Partial<ApexOptions> = {};
  bookingFunnelChart: Partial<ApexOptions> = {};
  revenueSplitChart: Partial<ApexOptions> = {};
  trainerRevenueChart: Partial<ApexOptions> = {};
  revenueContributionChart: Partial<ApexOptions> = {};
  programStatusChart: Partial<ApexOptions> = {};
  programsPerTrainerChart: Partial<ApexOptions> = {};
  programPopularityChart: Partial<ApexOptions> = {};
  fitnessCategoryChart: Partial<ApexOptions> = {};
  topTrainerProgramsChart: Partial<ApexOptions> = {};
  activityScatterChart: Partial<ApexOptions> = {};

  snapshot?: AdminDashboardSnapshot;
  loading = true;
  error?: string;

  constructor() {
    this.initializeCharts();
  }

  ngOnInit(): void {
    this.loadSnapshot();
  }

  getTrendLabel(change: number, trend: TrendDirection): string {
    const prefix = trend === 'down' ? '-' : '+';
    return `${prefix}${change}%`;
  }

  trackByTitle(_: number, card: KpiCard) {
    return card.title;
  }

  trackByName(_: number, entry: LeaderboardEntry) {
    return entry.name;
  }

  trackByUser(_: number, entry: ActivityUser | PurchasingUser) {
    return entry.name;
  }

  setActiveTab(tab: AnalyticsTab) {
    this.activeTab = tab;
  }

  setTabFilter(tab: AnalyticsTab, filterKey: string) {
    this.activeTabFilters[tab] = filterKey;
  }

  setReportFilter(filterKey: string) {
    if (this.selectedReportFilter === filterKey) {
      return;
    }
    this.selectedReportFilter = filterKey;
    this.loadSnapshot();
  }

  setDateRange(rangeKey: string) {
    if (this.activeDateRange === rangeKey) {
      return;
    }
    this.activeDateRange = rangeKey;
    this.loadSnapshot();
  }

  private initializeCharts(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    this.monthlySalesTrendChart = {
      series: [
        {
          name: 'Monthly Sales',
          data: [120, 210, 180, 260, 310, 340, 390, 420, 380, 410, 450, 520],
        },
      ],
      chart: { type: 'line', height: 300, toolbar: { show: false }, zoom: { enabled: false } },
      stroke: { curve: 'smooth', width: 4 },
      markers: { size: 5, colors: ['#fff'], strokeColors: '#0f172a', strokeWidth: 2 },
      colors: ['#0f172a'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: months,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#6b7280' } },
      },
      yaxis: {
        labels: {
          formatter: (value) => `₹${value}k`,
          style: { colors: '#6b7280' },
        },
      },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
      tooltip: { y: { formatter: (val) => `₹${val}k` } },
    };

    this.totalSalesAreaChart = {
      series: [
        { name: 'Actual', data: [85, 120, 140, 160, 190, 230, 250, 270, 300, 320, 340, 365] },
        { name: 'Projection', data: [90, 110, 135, 155, 180, 215, 240, 255, 280, 305, 330, 350] },
      ],
      chart: { type: 'area', height: 300, toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] },
      },
      dataLabels: { enabled: false },
      xaxis: { categories: months, labels: { style: { colors: '#6b7280' } } },
      colors: ['#111827', '#94a3b8'],
      yaxis: {
        labels: {
          formatter: (value) => `₹${value}k`,
          style: { colors: '#6b7280' },
        },
      },
      legend: { position: 'top', horizontalAlign: 'left' },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
    };

    this.programSalesBarChart = {
      series: [
        {
          name: 'Sales',
          data: [68, 94, 88, 54, 42, 73],
        },
      ],
      chart: { type: 'bar', height: 320, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
      colors: ['#1f2937'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['Zen Yoga', 'HIIT Ignite', 'Strength Lab', 'Mindful Mobility', 'Pilates Core', 'Metcon Burn'],
        labels: { rotate: -20 },
      },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
      yaxis: { labels: { formatter: (value) => `${value} sales` } },
    };

    this.categorySalesDonutChart = {
      series: [34, 26, 18, 12, 10],
      labels: ['Weight Loss', 'Functional', 'Yoga', 'Strength', 'Mobility'],
      chart: { type: 'donut', height: 320 },
      colors: ['#0f172a', '#1f2937', '#475569', '#94a3b8', '#cbd5f5'],
      dataLabels: { enabled: false },
      legend: { position: 'bottom' },
      stroke: { colors: ['#fff'] },
      plotOptions: { pie: { donut: { size: '72%' } } },
      tooltip: { y: { formatter: (val) => `${val}% of sales` } },
    };

    this.bookingsHeatmapChart = {
      series: [
        { name: 'Mon', data: this.buildHeatmapRow([26, 42, 35, 28, 46]) },
        { name: 'Tue', data: this.buildHeatmapRow([22, 34, 30, 24, 40]) },
        { name: 'Wed', data: this.buildHeatmapRow([30, 44, 32, 28, 45]) },
        { name: 'Thu', data: this.buildHeatmapRow([34, 48, 38, 32, 50]) },
        { name: 'Fri', data: this.buildHeatmapRow([38, 52, 40, 34, 56]) },
        { name: 'Sat', data: this.buildHeatmapRow([40, 54, 44, 36, 58]) },
        { name: 'Sun', data: this.buildHeatmapRow([28, 38, 32, 26, 42]) },
      ],
      chart: { type: 'heatmap', height: 320, toolbar: { show: false } },
      dataLabels: { enabled: false },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.45,
          radius: 12,
          colorScale: {
            ranges: [
              { from: 0, to: 20, color: '#e2e8f0' },
              { from: 21, to: 40, color: '#94a3b8' },
              { from: 41, to: 60, color: '#1f2937' },
            ],
          },
        },
      },
      xaxis: { categories: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM'] },
      legend: { position: 'bottom' },
    };

    this.bookingVolumeChart = {
      series: [
        { name: 'Weekly', data: [420, 460, 510, 480] },
        { name: 'Monthly', data: [1680, 1820, 1940, 1880] },
      ],
      chart: { type: 'bar', height: 320, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '45%', borderRadius: 8 } },
      colors: ['#111827', '#94a3b8'],
      dataLabels: { enabled: false },
      xaxis: { categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
      legend: { position: 'top', horizontalAlign: 'left' },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
    };

    this.bookingFunnelChart = {
      series: [
        {
          name: 'Users',
          data: [2400, 1850, 1420, 980, 640],
        },
      ],
      chart: { type: 'bar', height: 320, toolbar: { show: false } },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '70%',
          distributed: true,
          borderRadius: 6,
        },
      },
      colors: ['#0f172a', '#1f2937', '#334155', '#475569', '#94a3b8'],
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val} users`,
        offsetX: 30,
        style: { colors: ['#0f172a'] },
      },
      xaxis: {
        categories: ['Landing Visits', 'Program Views', 'Trial Booked', 'Checkout Started', 'Completed Booking'],
      },
      grid: { show: false },
    };

    this.revenueSplitChart = {
      series: [
        { name: 'Admin', data: [120, 138, 150, 162] },
        { name: 'Trainers', data: [90, 102, 118, 130] },
      ],
      chart: { type: 'bar', stacked: true, height: 320, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '45%', borderRadius: 8 } },
      colors: ['#0f172a', '#64748b'],
      dataLabels: { enabled: false },
      xaxis: { categories: ['Q1', 'Q2', 'Q3', 'Q4'] },
      legend: { position: 'top', horizontalAlign: 'left' },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
      tooltip: { y: { formatter: (val) => `₹${val}k` } },
    };

    this.trainerRevenueChart = {
      series: [
        { name: 'Programs', data: [82, 76, 64, 58, 52] },
        { name: 'Personal Sessions', data: [34, 42, 38, 30, 28] },
      ],
      chart: { type: 'bar', height: 320, toolbar: { show: false } },
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 8 } },
      colors: ['#111827', '#818cf8'],
      dataLabels: { enabled: false },
      xaxis: { categories: ['Amit', 'Zara', 'Neel', 'Riya', 'Kabir'] },
      legend: { position: 'top', horizontalAlign: 'left' },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
    };

    this.revenueContributionChart = {
      series: [38, 24, 18, 12, 8],
      labels: ['Programs', 'Subscriptions', 'Private Coaching', 'Workshops', 'Merchandise'],
      chart: { type: 'donut', height: 300 },
      plotOptions: { pie: { donut: { size: '70%' } } },
      colors: ['#0f172a', '#1f2937', '#334155', '#475569', '#94a3b8'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
    };

    this.programStatusChart = {
      series: [142, 18, 6],
      labels: ['Approved', 'Pending', 'Rejected'],
      chart: { type: 'pie', height: 280 },
      colors: ['#0f172a', '#fcd34d', '#f87171'],
      legend: { position: 'bottom' },
      dataLabels: {
        formatter: (val) => `${Number(val).toFixed(1)}%`,
      },
    };

    this.programsPerTrainerChart = {
      series: [{ name: 'Programs', data: [12, 15, 9, 11, 8] }],
      chart: { type: 'bar', height: 300, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 8, barHeight: '60%' } },
      colors: ['#111827'],
      dataLabels: { enabled: false },
      xaxis: { categories: ['Amit Rao', 'Zara Mehta', 'Neel Patel', 'Riya Kapoor', 'Kabir Khan'] },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
    };

    this.programPopularityChart = {
      series: [{ name: 'Enrollments', data: [940, 820, 760, 640, 590] }],
      chart: { type: 'bar', height: 300, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, borderRadius: 8, barHeight: '55%' } },
      colors: ['#475569'],
      dataLabels: { enabled: true, offsetX: -10, style: { colors: ['#fff'] } },
      xaxis: { categories: ['HIIT Ignite', 'Zen Yoga Flow', 'Strength Lab', 'Pilates Core', 'Metcon Burn'] },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
    };

    this.fitnessCategoryChart = {
      series: [420, 390, 360, 220, 410, 180],
      labels: ['Yoga', 'HIIT', 'Weight Loss', 'Pilates', 'Strength', 'Mindfulness'],
      chart: { type: 'donut', height: 320 },
      colors: ['#0f172a', '#111827', '#334155', '#475569', '#64748b', '#94a3b8'],
      legend: { position: 'bottom' },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (val) => `${val} sales` } },
    };

    this.topTrainerProgramsChart = {
      series: [{ name: 'Revenue', data: [112, 96, 88, 80, 76] }],
      chart: { type: 'bar', height: 320, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 8, columnWidth: '45%' } },
      colors: ['#0f172a'],
      dataLabels: { enabled: false },
      xaxis: { categories: ['HIIT Ignite', 'Strength Lab', 'Mobility Reset', 'Metcon Burn', 'Zen Yoga Flow'] },
      yaxis: { labels: { formatter: (value) => `₹${value}k` } },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
    };

    this.activityScatterChart = {
      series: [
        {
          name: 'Users',
          data: [
            [12, 8],
            [18, 10],
            [22, 12],
            [26, 15],
            [28, 16],
            [16, 9],
            [20, 11],
            [24, 13],
          ],
        },
      ],
      chart: { type: 'scatter', height: 320, toolbar: { show: false } },
      colors: ['#0f172a'],
      xaxis: { title: { text: 'Sessions per week' }, tickAmount: 6 },
      yaxis: { title: { text: 'Avg spend (₹k)' } },
      grid: { borderColor: 'rgba(15,23,42,0.08)', strokeDashArray: 4 },
      markers: { size: 8 },
      tooltip: {
        y: {
          formatter: (val) => `₹${val}k`,
        },
      },
    };
  }

  private buildHeatmapRow(values: number[]) {
    const slots = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM'];
    return values.map((value, index) => ({ x: slots[index], y: value }));
  }

  private loadSnapshot(): void {
    this.loading = true;
    this.error = undefined;
    this._adminService.getDashboardSnapshot(this.getSnapshotFilters()).subscribe({
      next: ({ data }) => {
        this.applySnapshot(data);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard data';
        this.loading = false;
      },
    });
  }

  private getSnapshotFilters(): { scope: AdminReportScope; range: AdminRangeFilter } {
    return {
      scope: this.selectedReportFilter as AdminReportScope,
      range: this.activeDateRange as AdminRangeFilter,
    };
  }

  private applySnapshot(snapshot: AdminDashboardSnapshot): void {
    this.snapshot = snapshot;
    this.kpiCards = snapshot.kpis.map((card) => ({
      title: card.title,
      value: this.formatMetric(card.icon, card.value),
      change: card.change,
      helper: card.helper,
      trend: card.trend,
      icon: card.icon,
      accent: card.accent,
    }));

    this.trainerLeaderboard = snapshot.people.trainerLeaderboard.map((entry) => ({
      name: entry.name,
      value: `₹${this.formatNumber(entry.value)}`,
      helper: entry.helper,
      percent: entry.percent,
    }));

    this.userActivityLeaders = snapshot.people.activityLeaders.map((user) => ({
      name: user.name,
      sessions: user.sessions,
      streak: user.streak,
    }));

    this.purchasingLeaders = snapshot.people.purchasingLeaders.map((user) => ({
      name: user.name,
      spend: `₹${this.formatNumber(user.spend)}`,
      programs: user.programs,
    }));

    this.buildSalesCharts(snapshot);
    this.buildBookingCharts(snapshot);
    this.buildRevenueCharts(snapshot);
    this.buildProgramCharts(snapshot);
    this.buildPeopleCharts(snapshot);
  }

  private buildSalesCharts(snapshot: AdminDashboardSnapshot): void {
    const sales = snapshot.sales;
    this.monthlySalesTrendChart = {
      ...this.monthlySalesTrendChart,
      series: [{ name: 'Monthly Sales', data: sales.monthlyTrend.values }],
      xaxis: { ...this.monthlySalesTrendChart.xaxis, categories: sales.monthlyTrend.categories },
    };

    this.totalSalesAreaChart = {
      ...this.totalSalesAreaChart,
      series: [
        { name: sales.totalsVsProjection.primaryLabel, data: sales.totalsVsProjection.primary },
        { name: sales.totalsVsProjection.secondaryLabel, data: sales.totalsVsProjection.secondary },
      ],
      xaxis: { ...this.totalSalesAreaChart.xaxis, categories: sales.totalsVsProjection.categories },
    };

    this.programSalesBarChart = {
      ...this.programSalesBarChart,
      series: [{ name: 'Sales', data: sales.programSales.values }],
      xaxis: { ...this.programSalesBarChart.xaxis, categories: sales.programSales.labels },
    };

    this.categorySalesDonutChart = {
      ...this.categorySalesDonutChart,
      series: sales.categoryMix.values,
      labels: sales.categoryMix.labels,
    };
  }

  private buildBookingCharts(snapshot: AdminDashboardSnapshot): void {
    const bookingSnapshot = snapshot.bookings;
    this.bookingsHeatmapChart = {
      ...this.bookingsHeatmapChart,
      series: bookingSnapshot.heatmap.map((day) => ({
        name: day.day,
        data: day.slots.map((slot) => ({ x: slot.label, y: slot.value })),
      })),
    };

    this.bookingVolumeChart = {
      ...this.bookingVolumeChart,
      series: [
        { name: bookingSnapshot.volume.primaryLabel, data: bookingSnapshot.volume.primary },
        { name: bookingSnapshot.volume.secondaryLabel, data: bookingSnapshot.volume.secondary },
      ],
      xaxis: { ...this.bookingVolumeChart.xaxis, categories: bookingSnapshot.volume.categories },
    };

    this.bookingFunnelChart = {
      ...this.bookingFunnelChart,
      series: [{ name: 'Users', data: bookingSnapshot.funnel.values }],
      xaxis: { ...this.bookingFunnelChart.xaxis, categories: bookingSnapshot.funnel.labels },
    };
  }

  private buildRevenueCharts(snapshot: AdminDashboardSnapshot): void {
    const revenue = snapshot.revenue;
    this.revenueSplitChart = {
      ...this.revenueSplitChart,
      series: revenue.splitByQuarter.series,
      xaxis: { ...this.revenueSplitChart.xaxis, categories: revenue.splitByQuarter.categories },
    };

    this.trainerRevenueChart = {
      ...this.trainerRevenueChart,
      series: revenue.perTrainer.series,
      xaxis: { ...this.trainerRevenueChart.xaxis, categories: revenue.perTrainer.categories },
    };

    this.revenueContributionChart = {
      ...this.revenueContributionChart,
      series: revenue.byCategory.values,
      labels: revenue.byCategory.labels,
    };
  }

  private buildProgramCharts(snapshot: AdminDashboardSnapshot): void {
    const programs = snapshot.programs;
    this.programStatusChart = {
      ...this.programStatusChart,
      series: programs.status.values,
      labels: programs.status.labels,
    };

    this.programsPerTrainerChart = {
      ...this.programsPerTrainerChart,
      series: [{ name: 'Programs', data: programs.perTrainer.values }],
      xaxis: { ...this.programsPerTrainerChart.xaxis, categories: programs.perTrainer.labels },
    };

    this.programPopularityChart = {
      ...this.programPopularityChart,
      series: [{ name: 'Enrollments', data: programs.popularity.values }],
      xaxis: { ...this.programPopularityChart.xaxis, categories: programs.popularity.labels },
    };

    this.fitnessCategoryChart = {
      ...this.fitnessCategoryChart,
      series: programs.categoryContribution.values,
      labels: programs.categoryContribution.labels,
    };
  }

  private buildPeopleCharts(snapshot: AdminDashboardSnapshot): void {
    this.topTrainerProgramsChart = {
      ...this.topTrainerProgramsChart,
      series: [{ name: 'Revenue', data: snapshot.revenue.perTrainer.series[0]?.data ?? [] }],
      xaxis: { ...this.topTrainerProgramsChart.xaxis, categories: snapshot.revenue.perTrainer.categories },
    };

    this.activityScatterChart = {
      ...this.activityScatterChart,
      series: [
        {
          name: 'Users',
          data: snapshot.people.activityVsSpend.map((point) => [point.sessions, point.spend]),
        },
      ],
    };
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value);
  }

  private formatMetric(icon: KpiCard['icon'], value: number): string {
    if (icon === 'sales' || icon === 'revenue') {
      return `₹${this.formatNumber(value)}`;
    }
    return this.formatNumber(value);
  }

  retryLoad(): void {
    this.loadSnapshot();
  }
}
