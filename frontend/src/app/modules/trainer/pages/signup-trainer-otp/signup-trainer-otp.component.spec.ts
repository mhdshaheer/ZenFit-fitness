import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupTrainerOtpComponent } from './signup-trainer-otp.component';

describe('SignupTrainerOtpComponent', () => {
  let component: SignupTrainerOtpComponent;
  let fixture: ComponentFixture<SignupTrainerOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupTrainerOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupTrainerOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
