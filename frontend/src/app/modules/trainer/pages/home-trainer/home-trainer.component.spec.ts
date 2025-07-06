import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTrainerComponent } from './home-trainer.component';

describe('HomeTrainerComponent', () => {
  let component: HomeTrainerComponent;
  let fixture: ComponentFixture<HomeTrainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeTrainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
