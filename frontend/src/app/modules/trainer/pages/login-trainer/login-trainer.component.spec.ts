import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginTrainerComponent } from './login-trainer.component';

describe('LoginTrainerComponent', () => {
  let component: LoginTrainerComponent;
  let fixture: ComponentFixture<LoginTrainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginTrainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
