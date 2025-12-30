import { Component, output, signal } from '@angular/core';
import { ModalComponent } from '../../layouts/modal/modal.component';

@Component({
  selector: 'app-modal-image',
  imports: [ModalComponent],
  templateUrl: './modal-image.component.html',
  styleUrl: './modal-image.component.css',
})
export class ModalImageComponent {
  typeURL = signal<string>('');
  urlImg = signal<string>('');
  titleImg = signal<string>('');
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
    this.modalValue.emit(`![${this.titleImg()}](${this.urlImg()})`);
    this.hideOrShowModal.emit(false);
  }

  onInput(event: Event, inputType: 'title' | 'url') {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    console.log(value);
    if (inputType === 'title') {
      this.titleImg.set(value);
    } else {
      this.urlImg.set(value);
    }
  }
}
