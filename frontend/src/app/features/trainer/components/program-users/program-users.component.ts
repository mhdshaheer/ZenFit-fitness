import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import {
    TrainerPurchasedProgram,
    TrainerPurchasedProgramFilters,
    TrainerPurchasedProgramsResponse,
    PaginationResult,
} from '../../../../interface/payment.interface';

@Component({
    selector: 'zenfit-program-users',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './program-users.component.html',
    styleUrl: './program-users.component.css',
})
export class ProgramUsersComponent implements OnInit, OnDestroy {
    private readonly _paymentService = inject(PaymentService);
    private readonly _route = inject(ActivatedRoute);
    private readonly _router = inject(Router);

    readonly Math = Math;

    enrolledUsers: TrainerPurchasedProgram[] = [];
    loading = false;
    error = '';
    programId = '';
    programTitle = '';

    pagination: PaginationResult = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
    };

    filters: TrainerPurchasedProgramFilters = {
        page: 1,
        limit: 10,
    };

    showDetailsModal = false;
    selectedUser: TrainerPurchasedProgram | null = null;

    ngOnInit(): void {
        this.programId = this._route.snapshot.paramMap.get('id') || '';
        this.programTitle =
            this._route.snapshot.queryParamMap.get('title') || 'Program';
        this.filters.programId = this.programId;

        if (!this.programId) {
            this.error = 'Program ID is missing. Please return to program list.';
            return;
        }

        this.loadEnrolledUsers();
    }

    ngOnDestroy(): void {
        this.selectedUser = null;
    }

    loadEnrolledUsers(): void {
        this.loading = true;
        this.error = '';

        this._paymentService
            .getTrainerPurchasedPrograms(this.filters)
            .subscribe({
                next: (response: TrainerPurchasedProgramsResponse) => {
                    if (response.success) {
                        this.enrolledUsers = response.data;
                        this.pagination = response.pagination;
                    }
                    this.loading = false;
                },
                error: () => {
                    this.error = 'Unable to load enrolled users. Please try again later.';
                    this.loading = false;
                },
            });
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.pagination.totalPages) return;
        this.filters.page = page;
        this.loadEnrolledUsers();
    }

    getPaymentBadge(status: string): string {
        switch (status) {
            case 'success':
                return 'bg-green-50 text-green-700 border border-green-200';
            case 'pending':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'failed':
                return 'bg-red-50 text-red-700 border border-red-200';
            default:
                return 'bg-gray-50 text-gray-600 border border-gray-200';
        }
    }

    formatDate(date: string | Date): string {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    viewMore(user: TrainerPurchasedProgram): void {
        this.selectedUser = user;
        this.showDetailsModal = true;
    }

    closeModal(): void {
        this.showDetailsModal = false;
        this.selectedUser = null;
    }

    navigateBack(): void {
        this._router.navigate(['/trainer/programs']);
    }
}
