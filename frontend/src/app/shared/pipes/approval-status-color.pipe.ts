import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'approvalStatusColor',
})
export class ApprovalStatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'Approved':
        return 'text-success-700 font-bold uppercase tracking-wider';
      case 'Rejected':
        return 'text-error-700 font-bold uppercase tracking-wider';
      case 'Pending':
        return 'text-warning-700 font-bold uppercase tracking-wider';
      default:
        return 'text-neutral-500';
    }
  }
}
