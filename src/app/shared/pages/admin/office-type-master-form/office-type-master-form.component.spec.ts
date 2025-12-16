import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeTypeMasterFormComponent } from './office-type-master-form.component';

describe('OfficeTypeMasterFormComponent', () => {
  let component: OfficeTypeMasterFormComponent;
  let fixture: ComponentFixture<OfficeTypeMasterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OfficeTypeMasterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficeTypeMasterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
