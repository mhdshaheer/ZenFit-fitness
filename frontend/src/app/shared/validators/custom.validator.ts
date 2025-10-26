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
  static dateOfBirth(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate < today ? null : { futureDate: true };
    };
  }
  static minimumAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age >= minAge
        ? null
        : { minimumAge: { required: minAge, actual: age } };
    };
  }
}
