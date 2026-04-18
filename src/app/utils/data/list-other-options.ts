import type { AsideElement } from '../types/button-option';

export const listIconsOthers: AsideElement[] = [
  {
    title: 'List ctrl+alt+l',
    iconSrc: 'icons/list.svg',
    iconAlt: 'List Icon',
    tag: '-',
    insert: 'start',
    combo: 'ctrl+alt+l',
  },
  {
    title: 'List Numeric ctrl+alt+n',
    iconSrc: 'icons/list-numeric.svg',
    iconAlt: 'List Numeric Icon',
    tag: '1.',
    insert: 'start',
    combo: 'ctrl+alt+n',
  },
  {
    title: 'Horizontal Rule  ctrl+alt+r',
    iconSrc: 'icons/line.svg',
    iconAlt: 'Horizontal Rule Icon',
    tag: '---',
    insert: 'start',
    combo: 'ctrl+alt+r',
  },
  {
    title: 'Code Inline ctrl+alt+c',
    iconSrc: 'icons/code.svg',
    iconAlt: 'Code Inline Icon',
    tag: '``',
    insert: 'between',
    combo: 'ctrl+alt+c',
  },
];
