import { Component, output, signal } from '@angular/core';
import { ModalComponent } from '../../layouts/modal/modal.component';

@Component({
  selector: 'app-modal-table',
  imports: [ModalComponent],
  templateUrl: './modal-table.component.html',
})
export class ModalTableComponent {
  numColumns = signal<string>('');
  numRows = signal<string>('');
  hideOrShowModal = output<boolean>();
  modalValue = output<string>();

  saveModal() {
    const columns = parseInt(this.numColumns() || '0', 10);
    const rows = parseInt(this.numRows() || '0', 10);

    if (columns > 0 && rows > 0) {
      let tableMarkdown = '';

      // Header row
      tableMarkdown += '| ' + ' Header |'.repeat(columns) + '\n';
      // Separator row
      tableMarkdown += '| ' + ' ------ |'.repeat(columns) + '\n';
      // Data rows
      for (let i = 0; i < rows; i++) {
        tableMarkdown += '| ' + ' Data |'.repeat(columns) + '\n';
      }

      this.modalValue.emit(tableMarkdown);
      this.hideOrShowModal.emit(false);
    } else {
      alert('Please enter valid numbers for columns and rows.');
    }
  }

  closeModal() {
    this.hideOrShowModal.emit(false);
  }

  clickInput(event: Event, type: 'column' | 'row') {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (type === 'column') {
      this.numColumns.set(value);
    } else {
      this.numRows.set(value);
    }
  }
}
