import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaymentService } from '../../../../core/services/payment.service';
import { PurchasedProgram } from '../../../../interface/payment.interface';
import { ToastService } from '../../../../core/services/toast.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'zenfit-transaction-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-history.component.html',
  styleUrl: './transaction-history.component.css'
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  private readonly _paymentService = inject(PaymentService);
  private readonly _toastService = inject(ToastService);
  private readonly _destroy$ = new Subject<void>();
  private readonly _searchSubject$ = new Subject<string>();
  private _logger = inject(LoggerService)

  transactions: PurchasedProgram[] = [];
  isLoading = true;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 1;

  // Filters
  selectedStatus: string = 'all';
  searchTerm: string = '';

  ngOnInit(): void {
    this.loadTransactions();
    this.setupSearchDebouncing();
  }

  private setupSearchDebouncing(): void {
    this._searchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this._destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.currentPage = 1;
        this.loadTransactions();
      });
  }

  loadTransactions(): void {
    this.isLoading = true;
    this._paymentService.getUserTransactionHistory(
      this.currentPage, 
      this.itemsPerPage,
      this.searchTerm,
      this.selectedStatus
    )
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.transactions = response.data;
          this.totalItems = response.total;
          this.totalPages = response.totalPages;
          this.currentPage = response.page;
          this.isLoading = false;
        },
        error: (error) => {
          this._logger.error('Error loading transactions:', error);
          this._toastService.error('Failed to load transaction history');
          this.isLoading = false;
        }
      });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadTransactions();
    }
  }

  onStatusFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedStatus = target.value;
    this.currentPage = 1;
    this.loadTransactions();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchSubject$.next(target.value);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'status-success';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-default';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getDisplayedItemsEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  getTrainerDisplayName(transaction: PurchasedProgram): string {
    if (transaction.trainerName && transaction.trainerName.trim()) {
      return transaction.trainerName;
    }
    return 'Trainer';
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._searchSubject$.complete();
  }
}
