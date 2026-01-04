import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ModalImageComponent } from '../../../src/app/components/modal-image/modal-image.component';

describe('ModalImageComponent', () => {
  let component: ModalImageComponent;
  let fixture: ComponentFixture<ModalImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalImageComponent);
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

  it('should update type title onInput', () => {
    const event = {
      target: { value: 'title img' },
    } as unknown as Event;

    component.onInput(event, 'title');

    expect(component.titleImg()).toBe('title img');
  });

  it('should update type url onInput', () => {
    const event = {
      target: { value: 'url img' },
    } as unknown as Event;

    component.onInput(event, 'url');

    expect(component.urlImg()).toBe('url img');
  });

  it('should emit markdown image and close modal when saveModal is called', () => {
    const modalSpy = jest.fn();
    const hideSpy = jest.fn();

    component.modalValue.subscribe(modalSpy);
    component.hideOrShowModal.subscribe(hideSpy);

    component.titleImg.set('Sample Image');
    component.urlImg.set('https://example.com/image.png');

    component.saveModal();

    expect(modalSpy).toHaveBeenCalledWith('![Sample Image](https://example.com/image.png)');
    expect(hideSpy).toHaveBeenCalledWith(false);
  });
});
