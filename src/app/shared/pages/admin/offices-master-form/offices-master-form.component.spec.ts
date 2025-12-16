import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficesMasterFormComponent } from './offices-master-form.component';

describe('OfficesMasterFormComponent', () => {
  let component: OfficesMasterFormComponent;
  let fixture: ComponentFixture<OfficesMasterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OfficesMasterFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficesMasterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
