import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from '../../src/app/app.component';
import { ClipboardImageStorageService } from '../../src/app/services/clipboard-image-storage.service';
import { ShortcutsService } from '../../src/app/services/shortcuts.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let shortcutsService: jest.Mocked<ShortcutsService>;
  let clipboardImageStorage: jest.Mocked<ClipboardImageStorageService>;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();

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
        {
          provide: ClipboardImageStorageService,
          useValue: {
            extractImageFileFromClipboard: jest.fn().mockReturnValue(null),
            normalizeMarkdownContent: jest.fn(async (markdown: string) => markdown),
            saveImage: jest.fn(),
            createStorageReference: jest.fn((imageId: string) => `local-image://${imageId}`),
            serializeMarkdownContent: jest.fn((markdown: string) => markdown),
            resolveImageSource: jest.fn((source: string) =>
              source === 'local-image://image-1' ? 'data:image/png;base64,abc123' : source,
            ),
            clearImages: jest.fn(),
            syncImagesWithMarkdownHistory: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    shortcutsService = TestBed.inject(ShortcutsService) as jest.Mocked<ShortcutsService>;
    clipboardImageStorage = TestBed.inject(
      ClipboardImageStorageService,
    ) as jest.Mocked<ClipboardImageStorageService>;
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
    expect(sessionStorage.getItem('md-editor-content')).toBe('hello');
  });

  it('should restore persisted editor content on init', async () => {
    sessionStorage.setItem('md-editor-content', '# persisted content');

    const persistedFixture = TestBed.createComponent(AppComponent);
    const persistedComponent = persistedFixture.componentInstance;
    persistedFixture.detectChanges();

    expect(persistedComponent.inputValue()).toBe('# persisted content');
    expect(persistedComponent.previewHtml()).toContain('<h1>persisted content</h1>');
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
    expect(sessionStorage.getItem('md-editor-content')).toBe('hello world');
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

  it('should persist pasted clipboard images and insert a local reference', async () => {
    const imageFile = new File(['image'], 'clipboard.png', { type: 'image/png' });
    const preventDefault = jest.fn();

    clipboardImageStorage.extractImageFileFromClipboard.mockReturnValue(imageFile);
    clipboardImageStorage.saveImage.mockResolvedValue({
      id: 'image-1',
      name: 'clipboard.png',
      dataUrl: 'data:image/png;base64,abc123',
      createdAt: Date.now(),
    });

    await component.onEditorPaste({
      clipboardData: {} as DataTransfer,
      preventDefault,
    } as unknown as ClipboardEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(clipboardImageStorage.saveImage).toHaveBeenCalledWith(imageFile, 'clipboard.png');
    expect(component.inputValue()).toBe('![clipboard.png](local-image://image-1)');
    expect(clipboardImageStorage.syncImagesWithMarkdownHistory).toHaveBeenCalledWith([
      '![clipboard.png](local-image://image-1)',
      '',
    ]);
  });

  it('should keep deleted local images while they are still recoverable through undo', () => {
    component.inputValue.set('![clipboard](local-image://image-1)');

    component.onInput({ target: { value: '' } } as unknown as Event);

    expect(component.inputValue()).toBe('');
    expect(clipboardImageStorage.syncImagesWithMarkdownHistory).toHaveBeenCalledWith([
      '',
      '![clipboard](local-image://image-1)',
    ]);
  });

  it('should keep local image references available after undo restores deleted content', () => {
    component.onInput({
      target: { value: '![clipboard](local-image://image-1)' },
    } as unknown as Event);
    component.onInput({ target: { value: '' } } as unknown as Event);

    component.undo();

    expect(component.inputValue()).toBe('![clipboard](local-image://image-1)');
    expect(clipboardImageStorage.syncImagesWithMarkdownHistory).toHaveBeenLastCalledWith([
      '![clipboard](local-image://image-1)',
      '',
      '',
    ]);
  });

  it('should alert and avoid inserting pasted images larger than the allowed size', async () => {
    const imageFile = new File(['image'], 'too-large.png', { type: 'image/png' });
    const preventDefault = jest.fn();
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    clipboardImageStorage.extractImageFileFromClipboard.mockReturnValue(imageFile);
    clipboardImageStorage.saveImage.mockRejectedValue(
      new Error('The image is too large. Maximum size: 1 MB.'),
    );

    await component.onEditorPaste({
      clipboardData: {} as DataTransfer,
      preventDefault,
    } as unknown as ClipboardEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('The image is too large. Maximum size: 1 MB.');
    expect(component.inputValue()).toBe('');
  });

  it('should resolve stored clipboard images in the preview html', () => {
    component.inputValue.set('![clipboard](local-image://image-1)');

    expect(component.previewHtml()).toContain('src="data:image/png;base64,abc123"');
  });

  it('should normalize uploaded base64 images into local references before inserting them', async () => {
    const fileReaderMock = {
      result: '![uploaded](data:image/png;base64,uploaded123)',
      onload: null as null | (() => void),
      readAsText: jest.fn(function (this: { onload: null | (() => Promise<void> | void) }) {
        return this.onload?.();
      }),
    };
    clipboardImageStorage.normalizeMarkdownContent.mockResolvedValue(
      '![uploaded](local-image://image-1)',
    );

    const fileReaderSpy = jest
      .spyOn(window as typeof window & { FileReader: typeof FileReader }, 'FileReader')
      .mockImplementation(() => fileReaderMock as unknown as FileReader);

    component.onFileUpload({
      target: {
        files: [new File(['markdown'], 'notes.md', { type: 'text/markdown' })],
        value: 'notes.md',
      },
    } as unknown as Event);

    await Promise.resolve();

    expect(clipboardImageStorage.normalizeMarkdownContent).toHaveBeenCalledWith(
      '![uploaded](data:image/png;base64,uploaded123)',
    );
    expect(component.inputValue()).toBe('![uploaded](local-image://image-1)');
    expect(component.previewHtml()).toContain('src="data:image/png;base64,abc123"');

    fileReaderSpy.mockRestore();
  });

  it('should alert and abort upload when imported images exceed the storage limit', async () => {
    const fileReaderMock = {
      result: '![uploaded](data:image/png;base64,uploaded123)',
      onload: null as null | (() => void),
      readAsText: jest.fn(function (this: { onload: null | (() => Promise<void> | void) }) {
        return this.onload?.();
      }),
    };
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    clipboardImageStorage.normalizeMarkdownContent.mockRejectedValue(
      new Error('Local image storage is full. Maximum total size: 2 MB.'),
    );

    const fileReaderSpy = jest
      .spyOn(window as typeof window & { FileReader: typeof FileReader }, 'FileReader')
      .mockImplementation(() => fileReaderMock as unknown as FileReader);

    component.onFileUpload({
      target: {
        files: [new File(['markdown'], 'notes.md', { type: 'text/markdown' })],
        value: 'notes.md',
      },
    } as unknown as Event);

    await Promise.resolve();

    expect(alertSpy).toHaveBeenCalledWith('Local image storage is full. Maximum total size: 2 MB.');
    expect(component.inputValue()).toBe('');

    fileReaderSpy.mockRestore();
  });

  it('should open save picker and write markdown file when supported', async () => {
    component.inputValue.set('![clipboard](local-image://image-1)');
    clipboardImageStorage.serializeMarkdownContent.mockReturnValue(
      '![clipboard](data:image/png;base64,abc123)',
    );

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
    expect(clipboardImageStorage.serializeMarkdownContent).toHaveBeenCalledWith(
      '![clipboard](local-image://image-1)',
    );
    expect(clipboardImageStorage.clearImages).toHaveBeenCalled();
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
    expect(clipboardImageStorage.clearImages).not.toHaveBeenCalled();
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
    expect(clipboardImageStorage.clearImages).not.toHaveBeenCalled();
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
    expect(clipboardImageStorage.clearImages).not.toHaveBeenCalled();
  });

  it('should download markdown with custom filename', () => {
    component.inputValue.set('![clipboard](local-image://image-1)');
    clipboardImageStorage.serializeMarkdownContent.mockReturnValue(
      '![clipboard](data:image/png;base64,abc123)',
    );

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
    expect(clipboardImageStorage.clearImages).toHaveBeenCalled();
  });
});
