import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private _authState = signal<{
    userId: string | null;
    role: 'user' | 'trainer' | 'admin' | null;
  }>({
    userId: null,
    role: null,
  });

  readonly userId = computed(() => this._authState().userId);
  readonly role = computed(() => this._authState().role);
}
