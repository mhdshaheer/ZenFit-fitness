import { AbstractControl, ValidationErrors } from '@angular/forms';

export function optionalPhoneValidator(
  control: AbstractControl
): ValidationErrors | null {
  if (!control.value) return null; // allow empty
  const valid = /^[0-9]{10}$/.test(control.value);
  return valid ? null : { invalidPhone: true };
}
