import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  private showToast(
    message: string,
    icon: SweetAlertIcon = 'success',
    duration = 2000
  ) {
    Swal.fire({
      position: 'top-end',
      icon: icon,
      title: message,
      showConfirmButton: false,
      toast: true,
      timer: duration,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  success(message: string, duration?: number) {
    this.showToast(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.showToast(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    this.showToast(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    this.showToast(message, 'info', duration);
  }
}
