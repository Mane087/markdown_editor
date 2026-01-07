import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-modal-table',
  imports: [],
  templateUrl: './modal-table.component.html',
})
export class ModalTableComponent {
  numColumns = signal<string>('');
  numRows = signal<string>('');
  hideOrShowModal = output<boolean>();
  modalValue = output<string>();

  saveModal() {
    console.log('inicio de save modal');

    const columns = parseInt(this.numColumns() || '0', 10);
    const rows = parseInt(this.numRows() || '0', 10);

    console.log(columns, 'columnas');
    console.log(rows, 'filas');

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
      console.log(tableMarkdown, 'valor a emitir');

      this.modalValue.emit(tableMarkdown);
      // this.hideOrShowModal.emit(false);
    } else {
      alert('Please enter valid numbers for columns and rows.');
    }
  }

  closeModal() {
    // this.hideOrShowModal.emit(false);
    this.modalValue.emit('');
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
