import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipAssigneeComponent } from './vip-assignee.component';

describe('VipAssigneeComponent', () => {
  let component: VipAssigneeComponent;
  let fixture: ComponentFixture<VipAssigneeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VipAssigneeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VipAssigneeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
