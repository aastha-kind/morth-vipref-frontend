import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMasterDialogComponent } from './user-master-dialog.component';

describe('UserMasterDialogComponent', () => {
  let component: UserMasterDialogComponent;
  let fixture: ComponentFixture<UserMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
