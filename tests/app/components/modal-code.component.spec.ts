import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ModalCodeComponent } from '../../../src/app/components/modal-code/modal-code.component';

describe('ModalCodeComponent', () => {
  let component: ModalCodeComponent;
  let fixture: ComponentFixture<ModalCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCodeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit hideOrShowModal=false when closeModal is called', () => {
    const spy = jest.fn();
    component.hideOrShowModal.subscribe(spy);

    component.closeModal();

    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should update type language onChange', () => {
    const event = {
      target: { value: 'javascript' },
    } as unknown as Event;

    component.onChange(event);

    expect(component.typeLanguage()).toBe('javascript');
  });

  it('should update code onInput', () => {
    const event = {
      target: { value: 'const a: number = 5;' },
    } as unknown as Event;

    component.onInput(event);

    expect(component.codeValue()).toBe('const a: number = 5;');
  });

  it('should emit markdown code block and close modal when saveModal is called', () => {
    const modalSpy = jest.fn();
    const hideSpy = jest.fn();

    component.modalValue.subscribe(modalSpy);
    component.hideOrShowModal.subscribe(hideSpy);

    component.typeLanguage.set('typescript');
    component.codeValue.set('const a: number = 5;');

    component.saveModal();

    expect(modalSpy).toHaveBeenCalledWith('```typescript\nconst a: number = 5;\n```');
    expect(hideSpy).toHaveBeenCalledWith(false);
  });
});
