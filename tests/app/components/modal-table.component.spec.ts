import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ModalTableComponent } from '../../../src/app/components/modal-table/modal-table.component';

describe('ModalTableComponent', () => {
  let component: ModalTableComponent;
  let fixture: ComponentFixture<ModalTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should emit hideOrShowModal=false when closeModal is called', () => {
    const spy = jest.fn();
    component.hideOrShowModal.subscribe(spy);

    component.closeModal();

    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should update type columns on clickInput', () => {
    const event = {
      target: { value: '1' },
    } as unknown as Event;

    component.clickInput(event, 'column');

    expect(component.numColumns()).toBe('1');
  });

  it('should update type rows on clickInput', () => {
    const event = {
      target: { value: '1' },
    } as unknown as Event;

    component.clickInput(event, 'row');

    expect(component.numRows()).toBe('1');
  });

  it('should emit markdown table and close modal when columns and rows are valid', () => {
    const modalSpy = jest.fn();
    const hideSpy = jest.fn();

    component.modalValue.subscribe(modalSpy);
    component.hideOrShowModal.subscribe(hideSpy);

    component.numColumns.set('2');
    component.numRows.set('3');

    component.saveModal();

    const expectedMarkdown =
      '|  Header | Header |\n' +
      '|  ------ | ------ |\n' +
      '|  Data | Data |\n' +
      '|  Data | Data |\n' +
      '|  Data | Data |\n';

    expect(modalSpy).toHaveBeenCalledWith(expectedMarkdown);
    expect(hideSpy).toHaveBeenCalledWith(false);
  });
});
