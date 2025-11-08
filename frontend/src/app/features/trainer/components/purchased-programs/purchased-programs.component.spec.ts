import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasedProgramsComponent } from './purchased-programs.component';

describe('PurchasedProgramsComponent', () => {
  let component: PurchasedProgramsComponent;
  let fixture: ComponentFixture<PurchasedProgramsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasedProgramsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasedProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
