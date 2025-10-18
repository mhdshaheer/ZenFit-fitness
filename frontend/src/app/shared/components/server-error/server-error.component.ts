import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'zenfit-server-error',
  imports: [],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.css',
})
export class ServerErrorComponent {
  private _router = inject(Router);

  goBack(): void {
    this._router.navigate(['/']);
  }
}
