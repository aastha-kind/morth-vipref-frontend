import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipFinalReplyComponent } from './vip-final-reply.component';

describe('VipFinalReplyComponent', () => {
  let component: VipFinalReplyComponent;
  let fixture: ComponentFixture<VipFinalReplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VipFinalReplyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VipFinalReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
