import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private _showToast(
    title: string,
    message: string = '',
    icon: SweetAlertIcon = 'success',
    duration = 3000
  ) {
    Swal.fire({
      position: 'top-end',
      icon: icon,
      title: title,
      html: message,
      showConfirmButton: false,
      toast: true,
      timer: duration,
      timerProgressBar: true,
      customClass: {
        container: 'premium-toast-container',
        popup: 'premium-toast-popup',
        title: 'premium-toast-title',
        htmlContainer: 'premium-toast-html',
        icon: 'premium-toast-icon',
        timerProgressBar: 'premium-toast-timer',
      },
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  success(title: string, subMessage: string | number = '', duration: number = 3000) {
    if (typeof subMessage === 'number') {
      this._showToast(title, '', 'success', subMessage);
    } else {
      this._showToast(title, subMessage, 'success', duration);
    }
  }

  error(title: string, subMessage: string | number = '', duration: number = 3000) {
    if (typeof subMessage === 'number') {
      this._showToast(title, '', 'error', subMessage);
    } else {
      this._showToast(title, subMessage, 'error', duration);
    }
  }

  warning(title: string, subMessage: string | number = '', duration: number = 3000) {
    if (typeof subMessage === 'number') {
      this._showToast(title, '', 'warning', subMessage);
    } else {
      this._showToast(title, subMessage, 'warning', duration);
    }
  }

  info(title: string, subMessage: string | number = '', duration: number = 3000) {
    if (typeof subMessage === 'number') {
      this._showToast(title, '', 'info', subMessage);
    } else {
      this._showToast(title, subMessage, 'info', duration);
    }
  }
}
