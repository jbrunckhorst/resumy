import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivacPolicyComponent } from './privac-policy.component';

describe('PrivacPolicyComponent', () => {
  let component: PrivacPolicyComponent;
  let fixture: ComponentFixture<PrivacPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrivacPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
