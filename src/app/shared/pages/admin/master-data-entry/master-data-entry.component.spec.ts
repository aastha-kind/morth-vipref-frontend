import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDataEntryComponent } from './master-data-entry.component';

describe('MasterDataEntryComponent', () => {
  let component: MasterDataEntryComponent;
  let fixture: ComponentFixture<MasterDataEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasterDataEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterDataEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
