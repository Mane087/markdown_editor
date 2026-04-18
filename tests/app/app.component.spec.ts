import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from '../../src/app/app.component';
import { ShortcutsService } from '../../src/app/services/shortcuts.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let shortcutsService: jest.Mocked<ShortcutsService>;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: ShortcutsService,
          useValue: {
            register: jest.fn(),
            handle: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    shortcutsService = TestBed.inject(ShortcutsService) as jest.Mocked<ShortcutsService>;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should update inputValue onInput', () => {
    const event = {
      target: { value: 'hello' },
    } as unknown as Event;

    component.onInput(event);

    expect(component.inputValue()).toBe('hello');
  });

  it('should undo and redo editor changes', () => {
    component.inputValue.set('hello');

    component.onInput({ target: { value: 'hello world' } } as unknown as Event);
    component.onInput({ target: { value: 'hello world!!!' } } as unknown as Event);

    component.undo();

    expect(component.inputValue()).toBe('hello world');

    component.undo();

    expect(component.inputValue()).toBe('hello');

    component.redo();

    expect(component.inputValue()).toBe('hello world');
  });

  it('should register undo and redo shortcuts on init', () => {
    expect(shortcutsService.register).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ combo: 'ctrl+z' }),
        expect.objectContaining({ combo: 'ctrl+shift+z' }),
      ]),
    );
  });

  it('should append element when no text is selected', () => {
    component.inputValue.set('hello');
    component.selectedText.set('');

    component.addElement('<b></b>', 'between');

    expect(component.inputValue()).toBe('<b></b>hello');
  });

  it('should wrap selected text when insert is between', () => {
    component.inputValue.set('hello');
    component.selectedText.set('hello');

    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    textarea.value = 'hello';
    textarea.selectionStart = 0;
    textarea.selectionEnd = 5;

    component.addElement('<b></b>', 'between');

    expect(component.inputValue()).toBe('<b>hello</b>');
  });

  it('should wrap selected text with inline code markers', () => {
    component.inputValue.set('hello');
    component.selectedText.set('ell');

    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    textarea.value = 'hello';
    textarea.selectionStart = 1;
    textarea.selectionEnd = 4;

    component.addElement('``', 'between');

    expect(component.inputValue()).toBe('h`ell`o');
  });

  it('should wrap selected text to uppercase', () => {
    component.inputValue.set('hello');
    component.selectedText.set('hello');

    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    textarea.value = 'hello';
    textarea.selectionStart = 0;
    textarea.selectionEnd = 5;

    component.toLowerCaseOrUpper('upper');

    expect(component.inputValue()).toBe('HELLO');
  });

  it('should toggle preview visibility', () => {
    const initial = component.hideOrShowPreview();

    component.hideOrShowPreviewToggle();

    expect(component.hideOrShowPreview()).toBe(!initial);
  });

  it('should toggle full or min preview', () => {
    const initial = component.fullOrMinPreview();

    component.fullOrMinPreviewToggle();

    expect(component.fullOrMinPreview()).toBe(!initial);
  });

  it('should close modal on Escape key', () => {
    component.showModal.set(true);

    component.handleKey(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(component.showModal()).toBe(false);
  });

  it('should delegate keyboard event to shortcutsService', () => {
    shortcutsService.handle.mockReturnValue(true);

    component.handleKey(new KeyboardEvent('keydown', { key: 'b' }));

    expect(shortcutsService.handle).toHaveBeenCalled();
  });

  it('should append element when select heading', () => {
    component.inputValue.set('hello');
    component.selectedText.set('');

    const event = {
      target: { value: '###' },
    } as unknown as Event;

    component.onHeadingChange(event);
    expect(component.inputValue()).toBe('### hello');
  });

  it('should show modal and insert type of modal', () => {
    component.openModal(true, 'image');
    expect(component.showModal()).toBe(true);
    expect(component.typeOfModal()).toBe('image');
  });

  it('should close modal on Backspace key', () => {
    component.selectedText.set('hello');

    component.handleKey(new KeyboardEvent('keydown', { key: 'Backspace' }));

    expect(component.selectedText()).toBe('');
  });

  it('should append element from modal', () => {
    component.inputValue.set('hello');
    component.selectedText.set('');

    const value = '[Google](https://google.com)';

    component.addElement(value, 'start');
    expect(component.inputValue()).toBe('[Google](https://google.com) hello');
  });

  it('should highlight the first search match while typing', () => {
    component.inputValue.set('Hello world hello');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    const searchInput = fixture.nativeElement.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;

    searchInput.focus();
    component.onSearchChange({ target: { value: 'hello' } } as unknown as Event);

    expect(component.activeMatchIndex()).toBe(0);
    expect(component.searchMatches()).toEqual([0, 12]);
    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe(5);
    expect(document.activeElement).toBe(searchInput);
  });

  it('should navigate forward and backward between search matches', () => {
    component.inputValue.set('alpha beta alpha beta');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    component.onSearchChange({ target: { value: 'beta' } } as unknown as Event);
    component.findNextMatch();

    expect(component.activeMatchIndex()).toBe(1);
    expect(textarea.selectionStart).toBe(17);
    expect(textarea.selectionEnd).toBe(21);

    component.findPreviousMatch();

    expect(component.activeMatchIndex()).toBe(0);
    expect(textarea.selectionStart).toBe(6);
    expect(textarea.selectionEnd).toBe(10);
  });

  it('should clear active search state when there are no matches', () => {
    component.inputValue.set('alpha beta');

    component.onSearchChange({ target: { value: 'gamma' } } as unknown as Event);

    expect(component.activeMatchIndex()).toBe(-1);
    expect(component.searchMatches()).toEqual([]);
    expect(component.searchStatusText()).toBe('Sin coincidencias');
  });

  it('should open save picker and write markdown file when supported', async () => {
    component.inputValue.set('# Hello');

    const write = jest.fn().mockResolvedValue(undefined);
    const close = jest.fn().mockResolvedValue(undefined);
    const createWritable = jest.fn().mockResolvedValue({ write, close });
    const showSaveFilePicker = jest.fn().mockResolvedValue({ createWritable });

    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      writable: true,
      value: showSaveFilePicker,
    });

    await component.downloadMarkdown();

    expect(showSaveFilePicker).toHaveBeenCalledWith({
      suggestedName: 'document.md',
      excludeAcceptAllOption: true,
      types: [
        {
          description: 'Markdown files',
          accept: {
            'text/markdown': ['.md'],
          },
        },
      ],
    });
    expect(createWritable).toHaveBeenCalled();
    expect(write).toHaveBeenCalledTimes(1);
    expect(write.mock.calls[0][0]).toBeTruthy();
    expect(close).toHaveBeenCalled();
  });

  it('should fallback to browser download when save picker is unavailable', async () => {
    component.inputValue.set('# Hello');

    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    await component.downloadMarkdown();

    expect(component.showModal()).toBe(true);
    expect(component.typeOfModal()).toBe('Save File');
    expect(component.suggestedMarkdownFileName()).toBe('document.md');
  });

  it('should not trigger fallback when user cancels save picker', async () => {
    component.inputValue.set('# Hello');

    const showSaveFilePicker = jest
      .fn()
      .mockRejectedValue(new DOMException('The user aborted a request.', 'AbortError'));

    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      writable: true,
      value: showSaveFilePicker,
    });

    const createObjectUrl = jest.fn().mockReturnValue('blob:test');

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });

    await component.downloadMarkdown();

    expect(showSaveFilePicker).toHaveBeenCalled();
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it('should open custom save modal when save picker fails', async () => {
    const showSaveFilePicker = jest
      .fn()
      .mockRejectedValue(new DOMException('Picker unavailable', 'SecurityError'));

    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      writable: true,
      value: showSaveFilePicker,
    });

    await component.downloadMarkdown();

    expect(component.showModal()).toBe(true);
    expect(component.typeOfModal()).toBe('Save File');
  });

  it('should download markdown with custom filename', () => {
    component.inputValue.set('# Hello');

    const click = jest.fn();
    const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement;
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(anchor);
    const createObjectUrl = jest.fn().mockReturnValue('blob:test');
    const revokeObjectUrl = jest.fn();

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      writable: true,
      value: revokeObjectUrl,
    });

    component.saveMarkdownWithCustomName('notes.md');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(anchor.href).toBe('blob:test');
    expect(anchor.download).toBe('notes.md');
    expect(click).toHaveBeenCalled();
    expect(createObjectUrl).toHaveBeenCalled();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:test');
  });
});
