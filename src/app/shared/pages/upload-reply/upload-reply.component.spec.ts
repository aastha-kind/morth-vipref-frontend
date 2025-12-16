import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadReplyComponent } from './upload-reply.component';

describe('UploadReplyComponent', () => {
  let component: UploadReplyComponent;
  let fixture: ComponentFixture<UploadReplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadReplyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
