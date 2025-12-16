import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationMasterFormComponent } from './organization-master-form.component';

describe('OrganizationMasterFormComponent', () => {
  let component: OrganizationMasterFormComponent;
  let fixture: ComponentFixture<OrganizationMasterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrganizationMasterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationMasterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
