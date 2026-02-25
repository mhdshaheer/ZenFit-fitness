import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedLoaderComponent } from './shared/components/shared-loader/shared-loader.component';
import { LoadingService } from './core/services/loading.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SharedLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Zenfit';
  loadingService = inject(LoadingService);
}
