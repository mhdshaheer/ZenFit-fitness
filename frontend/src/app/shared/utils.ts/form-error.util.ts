import { AbstractControl } from '@angular/forms';
import { ErrorMessages } from '../errorMessages/validation.error.messages';

export function getErrorMessages(form: AbstractControl, field: string): string {
  const control = form.get(field);
  if (control && control.errors) {
    const errors = control.errors;
    const errorMessage = ErrorMessages[field];
    for (const key in errors) {
      if (errorMessage[key]) {
        return errorMessage[key];
      }
    }
  }
  return '';
}
