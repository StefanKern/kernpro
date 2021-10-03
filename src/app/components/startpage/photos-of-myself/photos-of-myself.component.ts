import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'photos-of-myself',
  templateUrl: './photos-of-myself.component.html',
  styleUrls: ['./photos-of-myself.component.scss']
})
export class PhotosOfMyselfComponent implements OnInit {
  imageData = [
    {
      srcUrl: '/assets/photos-of-myself/outdoor.jpg',
      previewUrl: '/assets/photos-of-myself/outdoor.jpg'
    },
    {
      srcUrl: '/assets/photos-of-myself/at-we-are-developers.jpg',
      previewUrl: '/assets/photos-of-myself/at-we-are-developers.jpg'
    },
    {
      srcUrl: '/assets/photos-of-myself/hiking.jpg',
      previewUrl: '/assets/photos-of-myself/hiking.jpg'
    },
    {
      srcUrl: '/assets/photos-of-myself/lunch.jpg',
      previewUrl: '/assets/photos-of-myself/lunch.jpg'
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
