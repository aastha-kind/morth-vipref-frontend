import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleMasterDialogComponent } from './role-master-dialog.component';

describe('RoleMasterDialogComponent', () => {
  let component: RoleMasterDialogComponent;
  let fixture: ComponentFixture<RoleMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoleMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
