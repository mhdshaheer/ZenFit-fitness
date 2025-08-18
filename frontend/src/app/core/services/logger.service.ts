import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: unknown, ...optionalParams: unknown[]) {
    if (isDevMode()) {
      console.log('[LOG]:', message, ...optionalParams);
    }
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    if (isDevMode()) {
      console.warn('[WARN]:', message, ...optionalParams);
    }
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    console.error('[ERROR]:', message, ...optionalParams);
  }

  info(message: unknown, ...optionalParams: unknown[]) {
    if (isDevMode()) {
      console.info('[INFO]:', message, ...optionalParams);
    }
  }
}
