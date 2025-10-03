import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { CategoryService } from '../../core/services/category.service';

export function CategoryNameValidator(
  categoryService: CategoryService
): AsyncValidatorFn {
  return (controls: AbstractControl) => {
    if (!controls.value) return of(null);
    return categoryService.checkDuplicateName(controls.value).pipe(
      map((isDuplicate) => {
        return isDuplicate ? { duplicate: true } : null;
      }),
      catchError(() => of(null))
    );
  };
}
