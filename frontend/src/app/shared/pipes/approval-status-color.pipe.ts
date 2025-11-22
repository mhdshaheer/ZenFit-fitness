import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'approvalStatusColor',
})
export class ApprovalStatusColorPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'Approved':
        return 'text-green-700 font-semibold';
      case 'Rejected':
        return 'text-red-700 font-semibold';
      case 'Pending':
        return 'text-orange-700 font-semibold';
      default:
        return 'text-gray-500';
    }
  }
}
