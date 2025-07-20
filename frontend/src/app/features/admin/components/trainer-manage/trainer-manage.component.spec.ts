import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerManageComponent } from './trainer-manage.component';

describe('TrainerManageComponent', () => {
  let component: TrainerManageComponent;
  let fixture: ComponentFixture<TrainerManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
