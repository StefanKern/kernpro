import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WikiintroComponent } from './wikiintro.component';

describe('WikiintroComponent', () => {
  let component: WikiintroComponent;
  let fixture: ComponentFixture<WikiintroComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WikiintroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WikiintroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
