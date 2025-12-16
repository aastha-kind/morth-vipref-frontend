import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubCategoryMasterDialogComponent } from './sub-category-master-dialog.component';

describe('SubCategoryMasterDialogComponent', () => {
  let component: SubCategoryMasterDialogComponent;
  let fixture: ComponentFixture<SubCategoryMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubCategoryMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubCategoryMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
