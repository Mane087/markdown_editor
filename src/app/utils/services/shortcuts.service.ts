import { Injectable } from '@angular/core';
import type { Shortcut } from '../types/shortcut';

@Injectable({
  providedIn: 'root',
})
export class ShortcutsService {
  private shortcuts = new Map<string, () => void>();

  register(shortcuts: Shortcut[]) {
    shortcuts.forEach((s) => this.shortcuts.set(s.combo, s.run));
  }

  handle(event: KeyboardEvent): boolean {
    if (event.repeat) return false;

    const isCtrl = event.ctrlKey || event.metaKey;

    const combo = [isCtrl && 'ctrl', event.altKey && 'alt', event.key.toLowerCase()]
      .filter(Boolean)
      .join('+');

    const action = this.shortcuts.get(combo);

    if (!action) return false;

    event.preventDefault();
    event.stopPropagation();
    action();
    return true;
  }
}
