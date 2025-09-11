import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export class CustomValidators {
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailValidators = [
        Validators.required(control),
        Validators.email(control),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')(
          control
        ),
      ];

      for (const validator of emailValidators) {
        if (validator) return validator;
      }

      return null;
    };
  }
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return { required: true };
      }
      const phoneRegex = /^[0-9]{10}$/;
      return phoneRegex.test(value) ? null : { invalidPhone: true };
    };
  }
}
