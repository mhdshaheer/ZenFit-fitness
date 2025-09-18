import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerProgramSlotComponent } from './trainer-program-slot.component';

describe('TrainerProgramSlotComponent', () => {
  let component: TrainerProgramSlotComponent;
  let fixture: ComponentFixture<TrainerProgramSlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerProgramSlotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerProgramSlotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
