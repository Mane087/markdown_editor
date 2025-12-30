import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImageComponent } from './modal-image.component';

describe('ModalImageComponent', () => {
  let component: ModalImageComponent;
  let fixture: ComponentFixture<ModalImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
