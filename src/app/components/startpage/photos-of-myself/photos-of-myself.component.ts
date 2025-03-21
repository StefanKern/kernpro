import { NgIf } from '@angular/common';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { GalleryModule, GridLayout, Image, ModalGalleryRef, ModalGalleryService, PlainGalleryConfig, PlainGalleryStrategy, PlainLibConfig } from '@ks89/angular-modal-gallery';

@Component({
    selector: 'core-photos-of-myself',
    templateUrl: './photos-of-myself.component.html',
    styleUrls: ['./photos-of-myself.component.scss'],
    imports: [
      GalleryModule,
      NgIf
    ]
})
export class PhotosOfMyselfComponent implements OnInit {
  modalGalleryService = inject(ModalGalleryService);

  imageData = [
    new Image(0, {img: '/assets/photos-of-myself/outdoor.jpg'}),
    new Image(1, {img: '/assets/photos-of-myself/at-we-are-developers.jpg'}),
    new Image(2, {img: '/assets/photos-of-myself/hiking.jpg'}),
    new Image(3, {img: '/assets/photos-of-myself/lunch.jpg'})
  ];

  plainGalleryRow: PlainGalleryConfig;
  libConfigPlainGallery = signal<PlainLibConfig | null>(null);
  galleryVisible = signal(true); // Flag to control visibility of the gallery

  ngOnInit(): void {
    this.updateLayout(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    this.updateLayout(width);
  }

  private updateLayout(width: number): void {
    let layoutWidth = '200px';
    let layoutHeight = '200px';
    let length = 4; // Default: all images in one row

    if (width < 768) { // Small screens
      layoutWidth = '150px';
      layoutHeight = '150px';
      length = 2; // Two images per row
    }

    // Only update the configuration if the length has changed
    if (!this.plainGalleryRow || (this.plainGalleryRow.layout as GridLayout).breakConfig.length !== length) {
      debugger;
      this.plainGalleryRow = {
        strategy: PlainGalleryStrategy.GRID,
        layout: new GridLayout(
          { width: layoutWidth, height: layoutHeight },
          { length, wrap: true }
        )
      };

      this.libConfigPlainGallery.set({
        plainGalleryConfig: this.plainGalleryRow
      });

      // Force recreation of the gallery component
      this.galleryVisible.set(false);
      setTimeout(() => {
        this.galleryVisible.set(true);
      });
    }
  }

  onShow(id: number, index: number, images: Image[] = this.imageData): void {
    this.modalGalleryService.open({
      id,
      images,
      currentImage: images[index]
    }) as ModalGalleryRef;
  }
}
