import { Component, inject } from '@angular/core';
import {
  PaginationResult,
  TrainerPurchasedProgram,
  TrainerPurchasedProgramFilters,
} from '../../../../interface/payment.interface';
import { PaymentService } from '../../../../core/services/payment.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'zenfit-purchased-programs',
  imports: [FormsModule],
  templateUrl: './purchased-programs.component.html',
  styleUrl: './purchased-programs.component.css',
})
export class PurchasedProgramsComponent {
  purchasedPrograms: TrainerPurchasedProgram[] = [];
  pagination: PaginationResult = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  };
  filters: TrainerPurchasedProgramFilters = {
    page: 1,
    limit: 10,
    paymentStatus: '',
    search: '',
    startDate: '',
    endDate: '',
  };

  loading = false;
  selectedProgram: TrainerPurchasedProgram | null = null;
  showDetailsModal = false;

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  readonly Math = Math;
  private readonly _paymentService = inject(PaymentService);

  ngOnInit(): void {
    this.loadPurchasedPrograms();
  }

  loadPurchasedPrograms(): void {
    this.loading = true;

    this._paymentService.getTrainerPurchasedPrograms(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.purchasedPrograms = response.data;
          this.pagination = response.pagination;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading purchased programs:', error);
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.filters.page = 1;
    this.loadPurchasedPrograms();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadPurchasedPrograms();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadPurchasedPrograms();
  }

  viewDetails(program: TrainerPurchasedProgram): void {
    this.selectedProgram = program;
    this.showDetailsModal = true;
  }

  closeModal(): void {
    this.showDetailsModal = false;
    this.selectedProgram = null;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'success':
        return 'bg-gray-900 text-white';
      case 'pending':
        return 'bg-gray-400 text-white';
      case 'failed':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  }

  getDifficultyColor(level: string): string {
    switch (level) {
      case 'Beginner':
        return 'bg-gray-300 text-gray-800';
      case 'Intermediate':
        return 'bg-gray-500 text-white';
      case 'Advanced':
        return 'bg-gray-900 text-white';
      default:
        return 'bg-gray-400 text-gray-800';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  get displayedResultsEnd(): number {
    return this.pagination.page * this.pagination.limit > this.pagination.total
      ? this.pagination.total
      : this.pagination.page * this.pagination.limit;
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.page;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }
}
