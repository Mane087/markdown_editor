import hljs from 'highlight.js';
import type { Tokens } from 'marked';
import { marked } from 'marked';
import { NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Component, effect, signal, computed, inject } from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';

import type { AsideElement, AsideElementModal } from './utils/types/button-option';
import type { Headings } from './utils/types/heading';

import { ListHeadings } from './utils/data/list-headings';
import { listIconsText } from './utils/data/list-text-options';
import { listIconsModal } from './utils/data/list-modal-options';
import { listIconsOthers } from './utils/data/list-other-options';

import { ModalUrlComponent } from './components/modal-url/modal-url.component';
import { ModalCodeComponent } from './components/modal-code/modal-code.component';
import { ModalImageComponent } from './components/modal-image/modal-image.component';
import { ModalTableComponent } from './components/modal-table/modal-table.component';
import { ShortcutsService } from './utils/services/shortcuts.service';
import { ModalComponent } from './layouts/modal/modal.component';
import { alertExtension } from './utils/configs/marked-tips';
import { SelectComponent } from './components/select/select.component';
import type { Options } from './utils/types/option';
import { listAlerts } from './utils/data/list-alerts';

marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

marked.use({
  renderer: {
    code(token: Tokens.Code) {
      const { text, lang } = token;

      if (lang && hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(text, { language: lang }).value;
        return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      }

      const auto = hljs.highlightAuto(text).value;
      return `<pre><code class="hljs">${auto}</code></pre>`;
    },
  },
});
marked.use({ extensions: [alertExtension] });

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NgClass,
    ModalUrlComponent,
    ModalImageComponent,
    ModalCodeComponent,
    ModalTableComponent,
    ModalComponent,
    SelectComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  inputValue = signal<string>('');
  selectedText = signal<string>('');
  hideOrShowPreview = signal<boolean>(true);
  fullOrMinPreview = signal<boolean>(false);
  showModal = signal<boolean>(false);
  typeOfModal = signal<string>('');

  listIconsText: AsideElement[] = [];
  listIconsOthers: AsideElement[] = [];
  listIconsModal: AsideElementModal[] = [];
  listHeadings: Headings[] = [];
  listAlerts: Options[] = [];

  private sanitizer = inject(DomSanitizer);
  private shortcutsService = inject(ShortcutsService);

  previewHtml = computed<SafeHtml>(() => {
    const rawHtml = marked.parse(this.inputValue(), { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  });

  lineNumbers = computed<number[]>(() => {
    const lines = this.inputValue().split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  constructor() {
    effect(() => {
      this.listIconsText = listIconsText;
      this.listIconsOthers = listIconsOthers;
      this.listIconsModal = listIconsModal;
      this.listHeadings = ListHeadings;
      this.listAlerts = listAlerts;
      window.addEventListener('keydown', this.handleKey.bind(this));

      const shortcuts = this.listIconsText
        .filter((icon) => icon.combo)
        .map((icon) => ({
          combo: icon.combo!,
          run: () => this.addElement(icon.tag, icon.insert),
        }));

      const shortcutsOthers = this.listIconsOthers
        .filter((icon) => icon.combo)
        .map((icon) => ({
          combo: icon.combo!,
          run: () => this.addElement(icon.tag, icon.insert),
        }));

      const shortcutHeadings = this.listHeadings
        .filter((icon) => icon.combo)
        .map((icon) => ({
          combo: icon.combo,
          run: () => this.addElement(icon.value, 'start'),
        }));

      const fixedShortcuts = [
        {
          combo: 'ctrl+alt+a',
          run: () => this.toLowerCaseOrUpper('lower'),
        },
        {
          combo: 'ctrl+alt+u',
          run: () => this.toLowerCaseOrUpper('upper'),
        },

        {
          combo: 'ctrl+alt+p',
          run: () => this.hideOrShowPreviewToggle(),
        },
        {
          combo: 'ctrl+alt+f',
          run: () => this.fullOrMinPreviewToggle(),
        },
      ];

      shortcuts.push(...shortcutHeadings, ...fixedShortcuts, ...shortcutsOthers);

      this.shortcutsService.register(shortcuts);
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
      input.value.substring(input.selectionStart ?? 0, input.selectionEnd ?? 0),
    );
  }

  addElement(tag: string, insert: 'start' | 'between' | '') {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    const before = this.inputValue().slice(0, start);
    const selected = this.inputValue().slice(start, end);
    const after = this.inputValue().slice(end);

    let newValue = '';
    const space = before != '' ? '\n\n' : '';

    switch (insert) {
      case 'start':
        newValue = before + space + tag + ' ' + selected + after;
        break;
      case 'between': {
        const matches = tag.match(/<([a-z]+)[^>]*>(.*?)<\/\1>/i);
        if (matches) {
          const openTag = tag.replace(/<\/[a-z]+>.*$/, ''); // <b>
          const closeTag = tag.match(/<\/[a-z]+>/)?.[0] ?? ''; // </b>
          newValue = before + openTag + selected + closeTag + after;
        }
        break;
      }
      default:
        newValue = this.inputValue() + tag;
        break;
    }
    this.inputValue.set(newValue);
    this.selectedText.set('');
  }

  toLowerCaseOrUpper(type: 'lower' | 'upper') {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;

    const before = this.inputValue().slice(0, start);
    const selected = this.inputValue().slice(start, end);
    const after = this.inputValue().slice(end);

    const text = type === 'upper' ? selected.toUpperCase() : selected.toLowerCase();

    const newValue = before + text + after;

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
    console.log(value, typeModal, 'VALORES EN FUNCION OPENMODAL');

    this.showModal.set(value);
    this.typeOfModal.set(typeModal);
  }

  handleKey(event: KeyboardEvent) {
    if (event.repeat) return;
    if (event.key === 'Escape') {
      this.showModal.set(false);
    } else if (event.key === 'Backspace') {
      this.selectedText.set('');
    }
    if (this.shortcutsService.handle(event)) {
      return;
    }
  }

  downloadMarkdown() {
    const content = this.inputValue();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();

    URL.revokeObjectURL(url);
  }

  // downloadPdf() {}
}
