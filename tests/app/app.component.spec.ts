import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { AppComponent } from '../../src/app/app.component';
import { ShortcutsService } from '../../src/app/utils/services/shortcuts.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let shortcutsService: jest.Mocked<ShortcutsService>;

  beforeEach(async () => {
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
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: jest.fn((v) => v),
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

  it('should append element when no text is selected', () => {
    component.inputValue.set('hello');
    component.selectedText.set('');

    component.addElement('<b></b>', 'between');

    expect(component.inputValue()).toBe('hello\n<b></b>');
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
    expect(component.inputValue()).toBe('hello\n###');
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

    component.addContentFromModal(value);
    expect(component.inputValue()).toBe('hello\n[Google](https://google.com)');
  });
});
