import { inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    Router,
    UrlTree,
} from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { ProfileService } from '../services/profile.service';

@Injectable({ providedIn: 'root' })
export class TrainerResumeGuard implements CanActivate, CanActivateChild {
    private readonly _profileService = inject(ProfileService);
    private readonly _router = inject(Router);

    canActivate(
        route: ActivatedRouteSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this._evaluateAccess(route);
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this._evaluateAccess(childRoute);
    }

    private _evaluateAccess(route: ActivatedRouteSnapshot) {
        const targetPath = route.routeConfig?.path ?? '';

        return this._profileService.getProfile().pipe(
            map((profile) => {
                if (profile?.role !== 'trainer' || profile?.resumeVerified) {
                    return true;
                }

                if (this._isProfileRoute(targetPath)) {
                    return true;
                }

                return this._router.createUrlTree(['/trainer/profile']);
            }),
            catchError(() => of(this._router.createUrlTree(['/trainer/profile'])))
        );
    }

    private _isProfileRoute(path: string): boolean {
        if (!path) {
            return false;
        }

        return path.startsWith('profile');
    }
}
