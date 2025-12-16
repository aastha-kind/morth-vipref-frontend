import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDesignationMasterDialogComponent } from './user-designation-master-dialog.component';

describe('UserDesignationMasterDialogComponent', () => {
  let component: UserDesignationMasterDialogComponent;
  let fixture: ComponentFixture<UserDesignationMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDesignationMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDesignationMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
