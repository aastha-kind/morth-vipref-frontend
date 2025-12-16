import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClosedReferencesComponent } from './closed-references.component';

describe('ClosedReferencesComponent', () => {
  let component: ClosedReferencesComponent;
  let fixture: ComponentFixture<ClosedReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClosedReferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClosedReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
