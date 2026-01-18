import { TestBed } from '@angular/core/testing';
import { ShortcutsService } from '../../../src/app/utils/services/shortcuts.service';
import type { Shortcut } from '../../../src/app/utils/types/shortcut';

function createKeyboardEvent(key: string, options: Partial<KeyboardEvent> = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key,
    ctrlKey: options.ctrlKey ?? false,
    altKey: options.altKey ?? false,
    shiftKey: options.shiftKey ?? false,
    metaKey: options.metaKey ?? false,
  });

  Object.defineProperty(event, 'repeat', {
    get: () => options.repeat ?? false,
  });

  return event;
}

describe('ShortcutsService (Jest)', () => {
  let service: ShortcutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShortcutsService);
  });

  it('should register shortcuts and execute action', () => {
    const action = jest.fn();

    const shortcuts: Shortcut[] = [{ combo: 'ctrl+alt+b', run: action }];

    service.register(shortcuts);

    const event = createKeyboardEvent('b', {
      ctrlKey: true,
      altKey: true,
    });

    const handled = service.handle(event);

    expect(handled).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should prevent default and stop propagation when shortcut is handled', () => {
    const action = jest.fn();

    service.register([{ combo: 'ctrl+alt+i', run: action }]);

    const event = createKeyboardEvent('i', {
      ctrlKey: true,
      altKey: true,
    });

    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

    const handled = service.handle(event);

    expect(handled).toBe(true);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    expect(action).toHaveBeenCalled();
  });

  it('should return false if no shortcut matches', () => {
    const event = createKeyboardEvent('x', {
      ctrlKey: true,
      altKey: true,
    });

    expect(service.handle(event)).toBe(false);
  });

  it('should ignore repeated keydown events', () => {
    const action = jest.fn();

    service.register([{ combo: 'ctrl+alt+b', run: action }]);

    const event = createKeyboardEvent('b', {
      ctrlKey: true,
      altKey: true,
      repeat: true,
    });

    const handled = service.handle(event);

    expect(handled).toBe(false);
    expect(action).not.toHaveBeenCalled();
  });
});
