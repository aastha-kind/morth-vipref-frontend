import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationMasterDialogComponent } from './organization-master-dialog.component';

describe('OrganizationMasterDialogComponent', () => {
  let component: OrganizationMasterDialogComponent;
  let fixture: ComponentFixture<OrganizationMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
