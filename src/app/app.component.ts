import { Component, effect, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AsideElement,
  AsideElementModal,
} from './utils/interfaces/aside-element';
import { Headings } from './utils/interfaces/headings';
import { NgClass } from '@angular/common';
import { listIcons } from './utils/data/list-icon';
import { listIconsModal } from './utils/data/list-icons-modals';
import { ListHeadings } from './utils/data/headings';
import { ModalComponent } from './layouts/modal/modal.component';
import { ModalUrlComponent } from './components/modal-url/modal-url.component';
import { ModalImageComponent } from './components/modal-image/modal-image.component';
import { ModalCodeComponent } from './components/modal-code/modal-code.component';
import { ModalTableComponent } from './components/modal-table/modal-table.component';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

marked.setOptions({
  gfm: true, 
  breaks: true, 
  async: false,
});

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NgClass,
    ModalUrlComponent,
    ModalImageComponent,
    ModalCodeComponent,
    ModalTableComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  inputValue = signal<string>('');
  selectedText = signal<string>('');
  hideOrShowPreview = signal<boolean>(false);
  fullOrMinPreview = signal<boolean>(false);
  showModal = signal<boolean>(false);
  typeOfModal = signal<string>('');
  listIcons: AsideElement[] = [];
  listIconsModal: AsideElementModal[] = [];
  listHeadings: Headings[] = [];

  previewHtml = computed<SafeHtml>(() => {
    const rawHtml = marked.parse(this.inputValue(), { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  });

  constructor(private sanitizer: DomSanitizer) {
    effect(() => {
      this.listIcons = listIcons;
      this.listIconsModal = listIconsModal;
      this.listHeadings = ListHeadings;
      window.addEventListener('keydown', this.handleKey.bind(this));
    });
  }

  onInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    console.log(input.value);
    this.inputValue.set(input.value);
  }

  onSelect(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.selectedText.set(
      input.value.substring(input.selectionStart ?? 0, input.selectionEnd ?? 0)
    );
  }

  addElement(tag: string, insert: 'start' | 'between' | '') {
    console.log(`Inserting tag: ${tag} at position: ${insert}`);
    console.log(this.selectedText(), ' - SELECTED TEXT');

    if (this.selectedText() === '') {
      let breakLine = this.inputValue() != '' ? '\n' : '';
      console.log(breakLine, ' - BREAKLINE');
      this.inputValue.set(this.inputValue() + breakLine + tag);
      return;
    }

    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    const before = this.inputValue().slice(0, start);
    console.log(before, ' - BEFORE');
    const selected = this.inputValue().slice(start, end);
    console.log(selected, ' - SELECTED');
    const after = this.inputValue().slice(end);
    console.log(after, ' - AFTER');

    let newValue = '';
    let space = before != '' ? '\n' : '';

    switch (insert) {
      case 'start':
        newValue = before + space + tag + ' ' + selected + after;
        break;
      case 'between':
        const matches = tag.match(/<([a-z]+)[^>]*>(.*?)<\/\1>/i);
        if (matches) {
          const openTag = tag.replace(/<\/[a-z]+>.*$/, ''); // <b>
          const closeTag = tag.match(/<\/[a-z]+>/)?.[0] ?? ''; // </b>
          newValue = before + openTag + selected + closeTag + after;
        }
        break;
      default:
        newValue = this.inputValue() + tag;
        break;
    }

    this.inputValue.set(newValue);
    console.log(this.inputValue());
    this.selectedText.set('');
  }

  toLowerCaseOrUpper(type: 'lower' | 'upper') {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    const before = this.inputValue().slice(0, start);
    console.log(before, ' - BEFORE');
    const selected = this.inputValue().slice(start, end);
    console.log(selected, ' - SELECTED');
    const after = this.inputValue().slice(end);
    console.log(after, ' - AFTER');

    let text =
      type === 'upper' ? selected.toUpperCase() : selected.toLowerCase();

    let newValue = before + text + after;

    this.selectedText.set('');
    return this.inputValue.set(newValue);
  }

  hideOrShowPreviewToggle() {
    this.hideOrShowPreview.set(!this.hideOrShowPreview());
  }

  fullOrMinPreviewToggle() {
    this.fullOrMinPreview.set(!this.fullOrMinPreview());
  }

  onHeadingChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    this.addElement(value, 'start');
    select.value = '';
  }

  openModal(value: boolean, typeModal: string) {
    this.showModal.set(value);
    this.typeOfModal.set(typeModal);
  }

  handleKey(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showModal.set(false);
    } else if (event.key === 'Backspace') {
      this.selectedText.set('');
    }
  }

  addContentFromModal(value: string) {
    let isInputEmpty = this.inputValue() == '' ? '' : '\n';
    this.inputValue.set(this.inputValue() + isInputEmpty + value);
  }
}
