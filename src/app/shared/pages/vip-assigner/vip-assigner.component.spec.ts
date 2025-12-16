import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipAssignerComponent } from './vip-assigner.component';

describe('VipAssignerComponent', () => {
  let component: VipAssignerComponent;
  let fixture: ComponentFixture<VipAssignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VipAssignerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VipAssignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
