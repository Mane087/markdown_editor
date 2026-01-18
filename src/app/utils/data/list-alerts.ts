import type { Options } from '../types/option';

export const listAlerts: Options[] = [
  {
    value: '> [!NOTE]\n> This is a note alert.',
    label: 'Note',
    icon: 'icons/alert-note.svg',
  },
  {
    value: '> [!TIP]\n> This is a tip alert.',
    label: 'Tip',
    icon: 'icons/alert-tip.svg',
  },
  {
    value: '> [!IMPORTANT]\n> This is an important alert.',
    label: 'Important',
    icon: 'icons/alert-important.svg',
  },
  {
    value: '> [!WARNING]\n> This is a warning alert.',
    label: 'Warning',
    icon: 'icons/alert-warning.svg',
  },
  {
    value: '> [!CAUTION]\n> This is a caution alert.',
    label: 'Caution',
    icon: 'icons/alert-caution.svg',
  },
];
