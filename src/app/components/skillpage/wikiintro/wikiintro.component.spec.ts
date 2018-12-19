import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WikiintroComponent } from './wikiintro.component';

describe('WikiintroComponent', () => {
  let component: WikiintroComponent;
  let fixture: ComponentFixture<WikiintroComponent>;

  beforeEach(async(() => {
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
