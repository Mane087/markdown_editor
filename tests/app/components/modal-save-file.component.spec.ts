import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ModalSaveFileComponent } from '../../../src/app/components/modal-save-file/modal-save-file.component';

describe('ModalSaveFileComponent', () => {
  let component: ModalSaveFileComponent;
  let fixture: ComponentFixture<ModalSaveFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSaveFileComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSaveFileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialFileName', 'draft.md');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the file name from input', () => {
    expect(component.fileName()).toBe('draft.md');
  });

  it('should update fileName on input', () => {
    const event = {
      target: { value: 'meeting-notes' },
    } as unknown as Event;

    component.onInput(event);

    expect(component.fileName()).toBe('meeting-notes');
  });

  it('should emit normalized file name and close modal on save', () => {
    const saveSpy = jest.fn();
    const closeSpy = jest.fn();

    component.saveFileName.subscribe(saveSpy);
    component.hideOrShowModal.subscribe(closeSpy);
    component.fileName.set('meeting-notes');

    component.saveModal();

    expect(saveSpy).toHaveBeenCalledWith('meeting-notes.md');
    expect(closeSpy).toHaveBeenCalledWith(false);
  });

  it('should fallback to default name when file name is empty', () => {
    const saveSpy = jest.fn();

    component.saveFileName.subscribe(saveSpy);
    component.fileName.set('   ');

    component.saveModal();

    expect(saveSpy).toHaveBeenCalledWith('document.md');
  });
});
