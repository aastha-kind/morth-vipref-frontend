import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipInitiatorComponent } from './vip-initiator.component';

describe('VipInitiatorComponent', () => {
  let component: VipInitiatorComponent;
  let fixture: ComponentFixture<VipInitiatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VipInitiatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VipInitiatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
