import { Component, inject } from '@angular/core';
import { GalleryModule, Image, LineLayout, ModalGalleryRef, ModalGalleryService, PlainGalleryConfig, PlainGalleryStrategy, PlainLibConfig } from '@ks89/angular-modal-gallery';

@Component({
    selector: 'core-photos-of-myself',
    templateUrl: './photos-of-myself.component.html',
    styleUrls: ['./photos-of-myself.component.scss'],
    imports: [
      GalleryModule
    ]
})
export class PhotosOfMyselfComponent {
  modalGalleryService = inject(ModalGalleryService);

  imageData = [
    new Image(0, {img: '/assets/photos-of-myself/outdoor.jpg'}),
    new Image(1, {img: '/assets/photos-of-myself/at-we-are-developers.jpg'}),
    new Image(2,{img: '/assets/photos-of-myself/hiking.jpg'}),
    new Image(3, {img: '/assets/photos-of-myself/lunch.jpg'})
  ]
  
  plainGalleryRow: PlainGalleryConfig = { 
    strategy: PlainGalleryStrategy.ROW,
    layout: new LineLayout({ width: '200px', height: '200px' }, { length: 4, wrap: true }, 'space-evenly')
  };

  libConfigPlainGalleryRow: PlainLibConfig = {
    plainGalleryConfig: this.plainGalleryRow
  };
  

  onShow(id: number, index: number, images: Image[] = this.imageData): void {
    const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
      id,
      images,
      currentImage: images[index]
    }) as ModalGalleryRef;
  }
}
