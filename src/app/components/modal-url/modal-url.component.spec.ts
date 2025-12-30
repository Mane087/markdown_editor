import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUrlComponent } from './modal-url.component';

describe('ModalUrlComponent', () => {
  let component: ModalUrlComponent;
  let fixture: ComponentFixture<ModalUrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUrlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
