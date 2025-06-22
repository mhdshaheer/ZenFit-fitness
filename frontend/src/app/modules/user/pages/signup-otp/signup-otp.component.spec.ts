import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupOtpComponent } from './signup-otp.component';

describe('SignupOtpComponent', () => {
  let component: SignupOtpComponent;
  let fixture: ComponentFixture<SignupOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupOtpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
