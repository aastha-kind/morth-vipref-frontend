import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPanelFooterComponent } from './admin-panel-footer.component';

describe('AdminPanelFooterComponent', () => {
  let component: AdminPanelFooterComponent;
  let fixture: ComponentFixture<AdminPanelFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminPanelFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPanelFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
