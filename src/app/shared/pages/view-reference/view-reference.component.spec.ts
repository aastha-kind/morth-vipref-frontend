import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewReferenceComponent } from './view-reference.component';

describe('ViewReferenceComponent', () => {
  let component: ViewReferenceComponent;
  let fixture: ComponentFixture<ViewReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewReferenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
