import { Injectable, isDevMode } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: any, ...optionalParams: any[]) {
    if (isDevMode()) {
      console.log('[LOG]:', message, ...optionalParams);
    }
  }

  warn(message: any, ...optionalParams: any[]) {
    if (isDevMode()) {
      console.warn('[WARN]:', message, ...optionalParams);
    }
  }

  error(message: any, ...optionalParams: any[]) {
    console.error('[ERROR]:', message, ...optionalParams);
  }

  info(message: any, ...optionalParams: any[]) {
    if (isDevMode()) {
      console.info('[INFO]:', message, ...optionalParams);
    }
  }
}
