import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDesignationMasterComponent } from './user-designation-master.component';

describe('UserDesignationMasterComponent', () => {
  let component: UserDesignationMasterComponent;
  let fixture: ComponentFixture<UserDesignationMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDesignationMasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDesignationMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
