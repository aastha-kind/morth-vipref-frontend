import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPanelDashboardComponent } from './admin-panel-dashboard.component';

describe('AdminPanelDashboardComponent', () => {
  let component: AdminPanelDashboardComponent;
  let fixture: ComponentFixture<AdminPanelDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPanelDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPanelDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
