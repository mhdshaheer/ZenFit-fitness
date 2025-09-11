import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramCreateComponent } from './program-create.component';

describe('ProgramCreateComponent', () => {
  let component: ProgramCreateComponent;
  let fixture: ComponentFixture<ProgramCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
