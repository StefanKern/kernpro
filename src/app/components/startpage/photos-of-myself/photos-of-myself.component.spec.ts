import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotosOfMyselfComponent } from './photos-of-myself.component';

describe('PhotosOfMyselfComponent', () => {
  let component: PhotosOfMyselfComponent;
  let fixture: ComponentFixture<PhotosOfMyselfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhotosOfMyselfComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotosOfMyselfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
