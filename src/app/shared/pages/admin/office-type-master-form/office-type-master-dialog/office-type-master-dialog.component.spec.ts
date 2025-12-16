import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeTypeMasterDialogComponent } from './office-type-master-dialog.component';

describe('OfficeTypeMasterDialogComponent', () => {
  let component: OfficeTypeMasterDialogComponent;
  let fixture: ComponentFixture<OfficeTypeMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OfficeTypeMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeTypeMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
