import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SkillpageComponent } from './skillpage.component';

describe('SkillpageComponent', () => {
  let component: SkillpageComponent;
  let fixture: ComponentFixture<SkillpageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillpageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
