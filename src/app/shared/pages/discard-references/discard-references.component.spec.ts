import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscardReferencesComponent } from './discard-references.component';

describe('DiscardReferencesComponent', () => {
  let component: DiscardReferencesComponent;
  let fixture: ComponentFixture<DiscardReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiscardReferencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscardReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
