import { Component, effect, input, output, signal } from '@angular/core';

import { MARKDOWN_FILE } from '../../config/markdown-file';

@Component({
  selector: 'app-modal-save-file',
  imports: [],
  templateUrl: './modal-save-file.component.html',
})
export class ModalSaveFileComponent {
  readonly initialFileName = input<string>(MARKDOWN_FILE.defaultName);
  readonly hideOrShowModal = output<boolean>();
  readonly saveFileName = output<string>();

  readonly fileName = signal<string>(MARKDOWN_FILE.defaultName);

  constructor() {
    effect(() => {
      this.fileName.set(this.initialFileName());
    });
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fileName.set(input.value);
  }

  closeModal() {
    this.hideOrShowModal.emit(false);
  }

  saveModal() {
    const normalizedName = this.normalizeFileName(this.fileName());
    this.saveFileName.emit(normalizedName);
    this.hideOrShowModal.emit(false);
  }

  private normalizeFileName(fileName: string): string {
    const trimmedName = fileName.trim();

    if (!trimmedName) {
      return MARKDOWN_FILE.defaultName;
    }

    return trimmedName.toLowerCase().endsWith(MARKDOWN_FILE.extension)
      ? trimmedName
      : `${trimmedName}${MARKDOWN_FILE.extension}`;
  }
}
