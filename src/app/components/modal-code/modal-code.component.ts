import { Component, effect, output, signal } from '@angular/core';
import { ModalComponent } from '../../layouts/modal/modal.component';
import { Languages } from '../../utils/interfaces/lenguages';
import { listLanguages } from '../../utils/data/list-lenguages';

@Component({
  selector: 'app-modal-code',
  imports: [ModalComponent],
  templateUrl: './modal-code.component.html',
  styleUrl: './modal-code.component.css',
})
export class ModalCodeComponent {
  typeLanguage = signal<string>('');
  codeValue = signal<string>('');
  hideOrShowModal = output<boolean>();
  modalValue = output<string>();
  listLanguages: Languages[] = [];

  constructor() {
    effect(() => {
      this.listLanguages = listLanguages;
    });
  }

  onChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.typeLanguage.set(value);
  }

  closeModal() {
    this.hideOrShowModal.emit(false);
  }

  saveModal() {
    let formatValue = '```' + this.typeLanguage() + '\n' + this.codeValue() + '\n```';
    this.modalValue.emit(formatValue);
    this.hideOrShowModal.emit(false);
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    console.log(value);
    this.codeValue.set(value);
  }
}
