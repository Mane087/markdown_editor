import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTableComponent } from './modal-table.component';

describe('ModalTableComponent', () => {
  let component: ModalTableComponent;
  let fixture: ComponentFixture<ModalTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
