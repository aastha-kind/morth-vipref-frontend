import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadInitiatorDocsComponent } from './upload-initiator-docs.component';

describe('UploadInitiatorDocsComponent', () => {
  let component: UploadInitiatorDocsComponent;
  let fixture: ComponentFixture<UploadInitiatorDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadInitiatorDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadInitiatorDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
