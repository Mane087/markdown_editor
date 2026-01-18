import { Component, input, output, signal } from '@angular/core';
import type { Options } from '../../utils/types/option';

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  options = input<Options[]>([]);
  defaultOption = input<string>('');
  titleSelect = input<string>('');
  selection = output<string>();
  isOpen = signal<boolean>(false);
  currentSelction = signal<Options | null>(null);

  toggleDropdown(): void {
    this.isOpen.update((value) => !value);
  }

  selectOption(option: Options): void {
    this.selection.emit(option.value);
    this.isOpen.set(false);
  }

  close() {
    this.isOpen.set(false);
  }
}
