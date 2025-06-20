import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupTrainerComponent } from './signup-trainer.component';

describe('SignupTrainerComponent', () => {
  let component: SignupTrainerComponent;
  let fixture: ComponentFixture<SignupTrainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupTrainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
