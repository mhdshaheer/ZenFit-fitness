import { AbstractControl } from '@angular/forms';
import { ErrorMessages } from '../errorMessages/validation.error.messages';

export function getErrorMessages(form: AbstractControl, field: string): string {
  const control = form.get(field);
  if (control && control.errors) {
    const errors = control.errors;
    const errorMessage = ErrorMessages[field as keyof typeof ErrorMessages];
    if (errorMessage) {
      for (const key in errors) {
        if (errorMessage[key as keyof typeof errorMessage]) {
          return errorMessage[key as keyof typeof errorMessage];
        }
      }
    }
  }
  return '';
}
