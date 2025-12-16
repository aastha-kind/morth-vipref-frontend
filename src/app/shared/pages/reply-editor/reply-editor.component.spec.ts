import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyEditorComponent } from './reply-editor.component';

describe('ReplyEditorComponent', () => {
  let component: ReplyEditorComponent;
  let fixture: ComponentFixture<ReplyEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReplyEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplyEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
