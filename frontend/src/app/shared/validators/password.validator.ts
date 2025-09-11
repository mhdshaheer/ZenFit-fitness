import { AbstractControl, ValidationErrors } from '@angular/forms';

export function passwordStrengthValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecialChar = /[\W_]/.test(value);
  const isLongEnough = value.length >= 8;

  const valid =
    hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;

  return valid
    ? null
    : {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumber,
          hasSpecialChar,
          isLongEnough,
        },
      };
}
