import { Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  AsideElement,
  AsideElementModal,
} from './utils/interfaces/aside-element';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  inputValue = signal('');
  selectedText = signal('');
  listIcons: AsideElement[] = [];
  listIconsModal: AsideElementModal[] = [];

  constructor() {
    effect(() => {
      this.listIcons = [
        {
          title: 'Bold',
          iconSrc: '/icons/bold.svg',
          iconAlt: 'Bold Icon',
          tag: '<b></b>',
          insert: 'between',
        },
        {
          title: 'Italic',
          iconSrc: '/icons/italic.svg',
          iconAlt: 'Italic Icon',
          tag: '<i></i>',
          insert: 'between',
        },
        {
          title: 'Strikethrough',
          iconSrc: '/icons/strikethrough.svg',
          iconAlt: 'Strikethrough Icon',
          tag: '<s></s>',
          insert: 'between',
        },
        {
          title: 'Quote',
          iconSrc: '/icons/quote.svg',
          iconAlt: 'Quote Icon',
          tag: '>',
          insert: 'start',
        },
        {
          title: 'Uppercase',
          iconSrc: '/icons/uppercase.svg',
          iconAlt: 'Uppercase Icon',
          tag: '',
          insert: '',
        },
        {
          title: 'Lowercase',
          iconSrc: '/icons/lowercase.svg',
          iconAlt: 'Lowercase Icon',
          tag: '',
          insert: '',
        },
        {
          title: 'List',
          iconSrc: '/icons/list.svg',
          iconAlt: 'List Icon',
          tag: '-',
          insert: 'start',
        },
        {
          title: 'List Numeric',
          iconSrc: '/icons/list-numeric.svg',
          iconAlt: 'List Numeric Icon',
          tag: '1.',
          insert: 'start',
        },
        {
          title: 'Horizontal Rule',
          iconSrc: '/icons/line.svg',
          iconAlt: 'Horizontal Rule Icon',
          tag: '---',
          insert: 'start',
        },
        {
          title: 'Code Inline',
          iconSrc: '/icons/code.svg',
          iconAlt: 'Code Inline Icon',
          tag: '``',
          insert: 'between',
        },
      ];
      this.listIconsModal = [
        {
          title: 'Link',
          iconSrc: '/icons/link.svg',
          iconAlt: 'Link Icon',
        },
        {
          title: 'Image',
          iconSrc: '/icons/img.svg',
          iconAlt: 'Italic Icon',
        },
        {
          title: 'Bloc Code',
          iconSrc: '/icons/code_bloc.svg',
          iconAlt: 'Strikethrough Icon',
        },
        {
          title: 'Table',
          iconSrc: '/icons/table.svg',
          iconAlt: 'Quote Icon',
        },
      ];
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

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.selectedText.set('');
    }
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
        newValue = before + space + tag + selected + after;
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
}
