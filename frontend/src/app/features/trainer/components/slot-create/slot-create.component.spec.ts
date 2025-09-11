import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlotCreateComponent } from './slot-create.component';

describe('SlotCreateComponent', () => {
  let component: SlotCreateComponent;
  let fixture: ComponentFixture<SlotCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlotCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlotCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
