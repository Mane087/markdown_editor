import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { ModalUrlComponent } from '../../../src/app/components/modal-url/modal-url.component';

describe('ModalUrlComponent', () => {
  let component: ModalUrlComponent;
  let fixture: ComponentFixture<ModalUrlComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalUrlComponent],
    });

    fixture = TestBed.createComponent(ModalUrlComponent);
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

  it('should emit markdown link when typeURL is custom', () => {
    const valueSpy = jest.fn();
    const hideSpy = jest.fn();

    component.modalValue.subscribe(valueSpy);
    component.hideOrShowModal.subscribe(hideSpy);

    component.typeURL.set('custom');
    component.titleUrl.set('Google');
    component.contentUrl.set('https://google.com');

    component.saveModal();

    expect(valueSpy).toHaveBeenCalledWith('[Google](https://google.com)');
    expect(hideSpy).toHaveBeenCalledWith(false);
  });

  it('should emit raw URL when typeURL is not custom', () => {
    const valueSpy = jest.fn();
    const hideSpy = jest.fn();

    component.modalValue.subscribe(valueSpy);
    component.hideOrShowModal.subscribe(hideSpy);

    component.typeURL.set('simple');
    component.contentUrl.set('https://example.com');

    component.saveModal();

    expect(valueSpy).toHaveBeenCalledWith('<https://example.com>');
    expect(hideSpy).toHaveBeenCalledWith(false);
  });

  it('should update titleUrl signal on input', () => {
    const event = {
      target: { value: 'My title' },
    } as unknown as Event;

    component.onInput(event, 'title');

    expect(component.titleUrl()).toBe('My title');
  });

  it('should update contentUrl signal on input', () => {
    const event = {
      target: { value: 'https://site.com' },
    } as unknown as Event;

    component.onInput(event, 'url');

    expect(component.contentUrl()).toBe('https://site.com');
  });

  it('should update typeURL on change', () => {
    const event = {
      target: { value: 'custom' },
    } as unknown as Event;

    component.onChange(event);

    expect(component.typeURL()).toBe('custom');
  });
});
