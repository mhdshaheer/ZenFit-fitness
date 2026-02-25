import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-shared-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './shared-loader.component.html',
    styleUrl: './shared-loader.component.css'
})
export class SharedLoaderComponent {
    @Input() fullScreen = true;
    @Input() size: 'sm' | 'md' | 'lg' = 'md';
    @Input() text = 'Finding your balance...';
}
