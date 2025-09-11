import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerLayoutComponent } from './trainer-layout.component';

describe('TrainerLayoutComponent', () => {
  let component: TrainerLayoutComponent;
  let fixture: ComponentFixture<TrainerLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
