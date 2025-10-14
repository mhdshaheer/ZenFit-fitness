import { Component, Input } from '@angular/core';
import { ITopPrograms } from '../../../interface/program.interface';

@Component({
  selector: 'zenfit-list',
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  @Input() courses: ITopPrograms[] = [];

  formatNumber(num: number): string {
    return num.toLocaleString();
  }
}
