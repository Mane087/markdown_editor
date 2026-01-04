import { Component, output, signal } from '@angular/core';
import { ModalComponent } from '../../layouts/modal/modal.component';

@Component({
  selector: 'app-modal-url',
  imports: [ModalComponent],
  templateUrl: './modal-url.component.html',
})
export class ModalUrlComponent {
  typeURL = signal<string>('');
  titleUrl = signal<string>('');
  contentUrl = signal<string>('');
  hideOrShowModal = output<boolean>();
  modalValue = output<string>();

  onChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.typeURL.set(value);
  }

  closeModal() {
    this.hideOrShowModal.emit(false);
  }

  saveModal() {
    if (this.typeURL() === 'custom') {
      this.modalValue.emit(`[${this.titleUrl()}](${this.contentUrl()})`);
      this.hideOrShowModal.emit(false);
    } else {
      this.modalValue.emit(`<${this.contentUrl()}>`);
      this.hideOrShowModal.emit(false);
    }
  }

  onInput(event: Event, inputType: 'title' | 'url') {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    console.log(value);
    if (inputType === 'title') {
      this.titleUrl.set(value);
    } else {
      this.contentUrl.set(value);
    }
  }
}
