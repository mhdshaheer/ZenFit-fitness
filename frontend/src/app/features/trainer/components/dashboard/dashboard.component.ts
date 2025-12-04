import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { NgApexchartsModule, ApexOptions } from 'ng-apexcharts';
import { TrainerDashboardService } from '../../../../core/services/trainer-dashboard.service';
import {
  BookingDemandSeries,
  ClientLeaderboard,
  RevenueTrendSeries,
  SessionSeries,
  TrainerBookingFilter,
  TrainerDashboardSnapshot,
  TrainerKpiCard,
  TrainerRevenueFilter,
  TrainerSessionFilter,
} from '../../../../interface/trainer-dashboard.interface';

interface TrainerFilterOption<T extends string = string> {
  key: T;
  label: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly _dashboardService = inject(TrainerDashboardService);
  private snapshot?: TrainerDashboardSnapshot;
  loading = true;
  error?: string;

  readonly revenueFilters: TrainerFilterOption<TrainerRevenueFilter>[] = [
    { key: '3m', label: 'Last 3M' },
    { key: '6m', label: 'Last 6M' },
    { key: '12m', label: 'Last 12M' },
  ];

  readonly sessionFilters: TrainerFilterOption<TrainerSessionFilter>[] = [
    { key: 'week', label: 'Weekly' },
    { key: 'month', label: 'Monthly' },
  ];

  readonly bookingFilters: TrainerFilterOption<TrainerBookingFilter>[] = [
    { key: 'week', label: 'Weekly' },
    { key: 'month', label: 'Monthly' },
    { key: 'quarter', label: 'Quarterly' },
  ];

  activeRevenueFilter: TrainerRevenueFilter = '12m';
  activeSessionFilter: TrainerSessionFilter = 'week';
  activeBookingFilter: TrainerBookingFilter = 'week';

  kpiCards: TrainerKpiCard[] = [];

  clientLeaderboard: ClientLeaderboard[] = [];

  revenueTrendChart: Partial<ApexOptions> = {};

  sessionVolumeChart: Partial<ApexOptions> = {};

  bookingDemandChart: Partial<ApexOptions> = {};

  bookingConversionChart: Partial<ApexOptions> = {};

  programPerformanceChart: Partial<ApexOptions> = {};

  clientGoalChart: Partial<ApexOptions> = {};

  ngOnInit(): void {
    this.loadSnapshot();
  }

  setRevenueFilter(filter: TrainerRevenueFilter) {
    if (this.activeRevenueFilter === filter) {
      return;
    }
    this.activeRevenueFilter = filter;
    this.revenueTrendChart = this.buildRevenueChart(filter);
  }

  setSessionFilter(filter: TrainerSessionFilter) {
    if (this.activeSessionFilter === filter) {
      return;
    }
    this.activeSessionFilter = filter;
    this.sessionVolumeChart = this.buildSessionChart(filter);
  }

  setBookingFilter(filter: TrainerBookingFilter) {
    if (this.activeBookingFilter === filter) {
      return;
    }
    this.activeBookingFilter = filter;
    this.bookingDemandChart = this.buildBookingDemandChart(filter);
  }

  private loadSnapshot(): void {
    this.loading = true;
    this._dashboardService.getSnapshot().subscribe({
      next: ({ data }) => {
        const snapshot = data ?? this.buildMockSnapshot();
        this.applySnapshot(snapshot);
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard data';
        this.applySnapshot(this.buildMockSnapshot());
        this.loading = false;
      },
    });
  }

  private applySnapshot(snapshot: TrainerDashboardSnapshot): void {
    this.snapshot = snapshot;
    this.kpiCards = snapshot.kpis;
    this.clientLeaderboard = snapshot.clients.leaderboard;
    this.revenueTrendChart = this.buildRevenueChart(this.activeRevenueFilter);
    this.sessionVolumeChart = this.buildSessionChart(this.activeSessionFilter);
    this.bookingDemandChart = this.buildBookingDemandChart(this.activeBookingFilter);
    this.bookingConversionChart = this.buildBookingConversionChart();
    this.programPerformanceChart = this.buildProgramPerformanceChart();
    this.clientGoalChart = this.buildClientGoalChart();
  }

  private buildRevenueChart(filter: TrainerRevenueFilter): Partial<ApexOptions> {
    if (!this.snapshot) {
      return {};
    }
    const { categories, data } = this.snapshot.revenue.trend[filter];
    return {
      series: [
        {
          name: 'Revenue',
          data,
        },
      ],
      chart: { type: 'area', height: 280, toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#0f172a'],
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      dataLabels: { enabled: false },
      xaxis: { categories },
      yaxis: { labels: { formatter: (value) => `₹${value}k` } },
      tooltip: { y: { formatter: (val) => `₹${val}k` } },
    };
  }

  private buildSessionChart(filter: TrainerSessionFilter): Partial<ApexOptions> {
    if (!this.snapshot) {
      return {};
    }
    const { categories, completed, scheduled } = this.snapshot.sessions[filter];
    return {
      series: [
        { name: 'Completed', data: completed },
        { name: 'Scheduled', data: scheduled },
      ],
      chart: { type: 'bar', height: 300, stacked: true, toolbar: { show: false } },
      plotOptions: { bar: { borderRadius: 6, columnWidth: '45%' } },
      colors: ['#0f172a', '#94a3b8'],
      xaxis: { categories },
      legend: { position: 'top', horizontalAlign: 'left' },
      tooltip: { y: { formatter: (val) => `${val} sessions` } },
    };
  }

  private buildBookingDemandChart(filter: TrainerBookingFilter): Partial<ApexOptions> {
    if (!this.snapshot) {
      return {};
    }
    const { categories, requests, confirmed } = this.snapshot.bookings.demand[filter];
    return {
      series: [
        { name: 'Requests', data: requests },
        { name: 'Confirmed', data: confirmed },
      ],
      chart: { type: 'area', height: 260, toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#c026d3', '#0f172a'],
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.08, stops: [0, 90, 100] },
      },
      dataLabels: { enabled: false },
      xaxis: { categories },
      legend: { position: 'top', horizontalAlign: 'left' },
      tooltip: { y: { formatter: (val) => `${val} bookings` } },
    };
  }

  private buildBookingConversionChart(): Partial<ApexOptions> {
    if (!this.snapshot) {
      return {};
    }
    const conversion = this.snapshot.bookings.conversion;
    return {
      series: conversion.series,
      labels: conversion.labels,
      chart: { type: 'donut', height: 260 },
      plotOptions: { pie: { donut: { size: '68%' } } },
      colors: ['#0f172a', '#475569', '#f97316', '#94a3b8'],
      dataLabels: { enabled: false },
      legend: { position: 'bottom' },
      tooltip: { y: { formatter: (val) => `${val}%` } },
    };
  }

  private buildProgramPerformanceChart(): Partial<ApexOptions> {
    if (!this.snapshot) {
      return {};
    }
    const performance = this.snapshot.programs.performance;
    return {
      series: performance.series,
      labels: performance.labels,
      chart: { type: 'donut', height: 280 },
      plotOptions: { pie: { donut: { size: '70%' } } },
      colors: ['#0f172a', '#1f2937', '#334155', '#475569', '#94a3b8'],
      legend: { position: 'bottom' },
    };
  }

  private buildClientGoalChart(): Partial<ApexOptions> {
    if (!this.snapshot) {
      return {};
    }
    const goalTrend = this.snapshot.clients.goalTrend;
    return {
      series: [
        { name: 'Goal Completion', data: goalTrend.data },
      ],
      chart: { type: 'line', height: 240, toolbar: { show: false } },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#f97316'],
      dataLabels: { enabled: false },
      xaxis: { categories: goalTrend.categories },
      yaxis: { labels: { formatter: (val) => `${val}%` } },
    };
  }

  private buildMockSnapshot(): TrainerDashboardSnapshot {
    return {
      totals: {
        totalEarnings: 160000,
        activeClients: 48,
        livePrograms: 9,
        sessionUtilization: 82,
      },
      kpis: [
        {
          label: 'Monthly Revenue',
          value: '₹1.6L',
          change: 12.5,
          helper: 'vs last month',
          icon: '₹',
          trend: 'up',
        },
        {
          label: 'Active Clients',
          value: '48',
          change: 6.4,
          helper: 'training this week',
          icon: '👥',
          trend: 'up',
        },
        {
          label: 'Programs Live',
          value: '9',
          change: 1.2,
          helper: 'with spots available',
          icon: '📦',
          trend: 'up',
        },
        {
          label: 'Session Utilization',
          value: '82%',
          change: -3.1,
          helper: 'booked vs planned',
          icon: '🕒',
          trend: 'down',
        },
      ],
      revenue: {
        trend: {
          '3m': {
            categories: ['Oct', 'Nov', 'Dec'],
            data: [119, 131, 142],
          },
          '6m': {
            categories: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [106, 118, 124, 119, 131, 142],
          },
          '12m': {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [64, 72, 68, 84, 95, 112, 106, 118, 124, 119, 131, 142],
          },
        },
      },
      sessions: {
        week: {
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          completed: [32, 36, 34, 40, 45, 41, 48],
          scheduled: [38, 40, 42, 46, 52, 49, 54],
        },
        month: {
          categories: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
          completed: [138, 142, 150, 161],
          scheduled: [152, 158, 166, 178],
        },
      },
      bookings: {
        demand: {
          week: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            requests: [22, 28, 26, 30, 34, 29, 24],
            confirmed: [18, 24, 22, 26, 30, 27, 21],
          },
          month: {
            categories: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
            requests: [108, 114, 120, 126],
            confirmed: [92, 96, 101, 110],
          },
          quarter: {
            categories: ['Jan', 'Feb', 'Mar'],
            requests: [320, 342, 365],
            confirmed: [272, 295, 318],
          },
        },
        conversion: {
          labels: ['Confirmed', 'Waitlisted', 'Canceled', 'No-shows'],
          series: [68, 18, 9, 5],
        },
      },
      programs: {
        performance: {
          labels: ['HIIT Ignite', 'Strength Forge', 'Mobility Reset', 'Pilates Core', 'Metcon Burn'],
          series: [78, 65, 54, 48, 42],
        },
      },
      clients: {
        leaderboard: [
          { name: 'Ananya Rao', sessions: 18, focus: 'Lean Mass • 4 weeks', completion: 86 },
          { name: 'Rishi Verma', sessions: 16, focus: 'Mobility Reset', completion: 82 },
          { name: 'Divya Iyer', sessions: 14, focus: 'Strength 101', completion: 78 },
          { name: 'Kabir Nair', sessions: 12, focus: 'Endurance Build', completion: 72 },
        ],
        goalTrend: {
          categories: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
          data: [88, 84, 81, 76, 72, 68, 66, 63, 60, 58],
        },
      },
    };
  }
}
