import { AsideElement } from '../interfaces/aside-element';

export const listIcons: AsideElement[] = [
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
