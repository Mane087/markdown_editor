import { marked } from 'marked';
import { NgClass } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import type { ElementRef } from '@angular/core';
import {
  Component,
  signal,
  computed,
  inject,
  DestroyRef,
  Renderer2,
  viewChild,
  afterNextRender,
} from '@angular/core';
import DOMPurify from 'dompurify';

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
import { ShortcutsService } from './services/shortcuts.service';
import { ModalComponent } from './layouts/modal/modal.component';
import { alertExtension } from './config/marked-tips';
import { codeExtension } from './config/marked-code';
import { SelectComponent } from './components/select/select.component';
import type { Options } from './utils/types/option';
import { listAlerts } from './utils/data/list-alerts';

marked.setOptions({
  gfm: true,
  breaks: true,
  async: false,
});

marked.use(codeExtension);
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
  searchQuery = signal<string>('');
  lastMatchIndex = signal<number>(0);

  listIconsText: AsideElement[] = listIconsText;
  listIconsOthers: AsideElement[] = listIconsOthers;
  listIconsModal: AsideElementModal[] = listIconsModal;
  listHeadings: Headings[] = ListHeadings;
  listAlerts: Options[] = listAlerts;

  readonly editorTextarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('editorTextarea');
  readonly lineNumber = viewChild.required<ElementRef<HTMLDivElement>>('lineNumber');

  private shortcutsService = inject(ShortcutsService);
  private destroyRef = inject(DestroyRef);
  private renderer = inject(Renderer2);

  previewHtml = computed<string>(() => {
    const rawHtml = marked.parse(this.inputValue(), { async: false }) as string;
    return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
  });

  lineNumbers = computed<number[]>(() => {
    const lines = this.inputValue().split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  constructor() {
    const removeListener = this.renderer.listen('window', 'keydown', (event: KeyboardEvent) => {
      this.handleKey(event);
    });

    this.destroyRef.onDestroy(() => removeListener());
    afterNextRender(() => this.syncScroll());

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
  }

  syncScroll() {
    this.lineNumber().nativeElement.scrollTop = this.editorTextarea().nativeElement.scrollTop;
  }

  onInput(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.inputValue.set(input.value);
  }

  onSelect(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.selectedText.set(
      input.value.substring(input.selectionStart ?? 0, input.selectionEnd ?? 0),
    );
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.lastMatchIndex.set(0);
  }

  findNextMatch() {
    const query = this.searchQuery().trim();
    if (!query) {
      return;
    }

    const text = this.inputValue();
    const queryText = query.toLowerCase();
    const textLower = text.toLowerCase();
    const textarea = this.editorTextarea().nativeElement;
    const currentIndex = textarea?.selectionEnd ?? this.lastMatchIndex();

    let index = textLower.indexOf(queryText, currentIndex);
    if (index === -1 && currentIndex !== 0) {
      index = textLower.indexOf(queryText, 0);
    }

    if (index === -1) {
      return;
    }

    const end = index + query.length;
    this.lastMatchIndex.set(end);

    if (textarea) {
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(index, end);
        const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight || '16');
        const line = text.slice(0, index).split('\n').length - 1;
        const targetTop = Math.max(0, line * lineHeight - textarea.clientHeight / 2);
        textarea.scrollTop = targetTop;
      });
    }
  }

  insertTextAtCursor(text: string) {
    const textarea = this.editorTextarea().nativeElement;
    const start = textarea?.selectionStart ?? this.inputValue().length;
    const end = textarea?.selectionEnd ?? this.inputValue().length;

    const before = this.inputValue().slice(0, start);
    const after = this.inputValue().slice(end);
    const newValue = before + text + after;

    this.inputValue.set(newValue);
    this.selectedText.set('');

    if (textarea) {
      const cursorPos = start + text.length;
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    }
  }

  onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      this.insertTextAtCursor(content);
      input.value = '';
    };

    reader.readAsText(file);
  }

  addElement(tag: string, insert: 'start' | 'between' | '') {
    const textarea = this.editorTextarea().nativeElement;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;

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
    const textarea = this.editorTextarea().nativeElement;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;

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
    this.showModal.set(value);
    this.typeOfModal.set(typeModal);
  }

  handleKey(event: KeyboardEvent) {
    if (event.repeat) return;
    if (event.key === 'Escape') {
      this.showModal.set(false);
      this.typeOfModal.set('');
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
}
