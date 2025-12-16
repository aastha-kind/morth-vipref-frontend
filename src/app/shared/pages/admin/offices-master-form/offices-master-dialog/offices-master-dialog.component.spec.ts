import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficesMasterDialogComponent } from './offices-master-dialog.component';

describe('OfficesMasterDialogComponent', () => {
  let component: OfficesMasterDialogComponent;
  let fixture: ComponentFixture<OfficesMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OfficesMasterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficesMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
