import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private _isLoading = signal(false);
    private _loadingText = signal('Finding your balance...');

    readonly isLoading = this._isLoading.asReadonly();
    readonly loadingText = this._loadingText.asReadonly();

    show(text?: string) {
        if (text) this._loadingText.set(text);
        this._isLoading.set(true);
    }

    hide() {
        this._isLoading.set(false);
        // Reset to default text after animation
        setTimeout(() => this._loadingText.set('Finding your balance...'), 500);
    }
}
