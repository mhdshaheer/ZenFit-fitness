import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceSearch } from '../../utils.ts/debouce.util';

@Component({
  selector: 'zenfit-search-bar',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css',
})
export class SearchBarComponent {
  @Output() searchChanged = new EventEmitter<string>();
  searchControl = new FormControl('');

  private debouncedEmit = debounceSearch((query: string) => {
    this.searchChanged.emit(query);
  }, 300);

  constructor() {
    this.searchControl.valueChanges.subscribe((value) => {
      this.debouncedEmit(value?.trim() || '');
    });
  }
  clearSearch() {
    this.searchControl.setValue('');
  }
}
