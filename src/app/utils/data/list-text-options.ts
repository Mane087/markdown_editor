import type { AsideElement } from '../types/button-option';

export const listIconsText: AsideElement[] = [
  {
    title: 'Bold',
    iconSrc: 'icons/bold.svg',
    iconAlt: 'Bold Icon',
    tag: '<b></b>',
    insert: 'between',
    combo: 'ctrl+alt+b',
  },
  {
    title: 'Italic',
    iconSrc: 'icons/italic.svg',
    iconAlt: 'Italic Icon',
    tag: '<i></i>',
    insert: 'between',
    combo: 'ctrl+alt+i',
  },
  {
    title: 'Underlined',
    iconSrc: 'icons/strikethrough.svg',
    iconAlt: 'Underlined Icon',
    tag: '<u></u>',
    insert: 'between',
    combo: 'ctrl+alt+s',
  },
  {
    title: 'Quote',
    iconSrc: 'icons/quote.svg',
    iconAlt: 'Quote Icon',
    tag: '>',
    insert: 'start',
    combo: 'ctrl+alt+q',
  },
];
