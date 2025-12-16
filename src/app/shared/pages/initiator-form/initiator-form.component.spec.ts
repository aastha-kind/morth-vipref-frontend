import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitiatorFormComponent } from './initiator-form.component';

describe('InitiatorFormComponent', () => {
  let component: InitiatorFormComponent;
  let fixture: ComponentFixture<InitiatorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InitiatorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitiatorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
