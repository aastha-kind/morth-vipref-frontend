import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterReportsComponent } from './master-reports.component';

describe('MasterReportsComponent', () => {
  let component: MasterReportsComponent;
  let fixture: ComponentFixture<MasterReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MasterReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
