export type InsertPosition = 'start' | 'between';

export interface Shortcut {
  combo: string;
  run: () => void;
}
