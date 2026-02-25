import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-shared-skeleton',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './shared-skeleton.component.html',
    styleUrl: './shared-skeleton.component.css'
})
export class SharedSkeletonComponent {
    @Input() type: 'card' | 'list' | 'text' | 'round' | 'rect' = 'rect';
    @Input() width = '100%';
    @Input() height = '20px';
    @Input() borderRadius = '0.5rem';
    @Input() count = 1;

    get arrayFromCount() {
        return Array(this.count).fill(0);
    }
}
