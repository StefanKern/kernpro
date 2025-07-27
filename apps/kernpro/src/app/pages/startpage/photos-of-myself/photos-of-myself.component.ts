import { NgIf } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  GalleryModule,
  GridLayout,
  Image,
  ModalGalleryRef,
  ModalGalleryService,
  PlainGalleryConfig,
  PlainGalleryStrategy,
  PlainLibConfig,
} from '@ks89/angular-modal-gallery';
import { OverlayModule } from '@angular/cdk/overlay';

@Component({
  selector: 'core-photos-of-myself',
  templateUrl: './photos-of-myself.component.html',
  styleUrls: ['./photos-of-myself.component.scss'],
  imports: [OverlayModule, GalleryModule, NgIf],
})
export class PhotosOfMyselfComponent implements OnInit {
  modalGalleryService = inject(ModalGalleryService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  imageData = [
    new Image(0, { img: 'assets/photos-of-myself/me-and-my-baby.png' }),
    new Image(1, { img: 'assets/photos-of-myself/at-my-wedding.jpg' }),
    new Image(2, { img: 'assets/photos-of-myself/outdoor.jpg' }),
    new Image(3, { img: 'assets/photos-of-myself/at-we-are-developers.jpg' }),
    new Image(4, { img: 'assets/photos-of-myself/hiking.jpg' }),
    new Image(5, { img: 'assets/photos-of-myself/lunch.jpg' }),
  ];

  plainGalleryRow?: PlainGalleryConfig;
  libConfigPlainGallery = signal<PlainLibConfig | undefined>(undefined);
  galleryVisible = signal(true);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateLayout(window.innerWidth);
    } else {
      // Set default layout for SSR
      this.updateLayout(1024);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (isPlatformBrowser(this.platformId)) {
      const width = (event.target as Window).innerWidth;
      this.updateLayout(width);
    }
  }

  private updateLayout(width: number): void {
    let layoutWidth = '200px';
    let layoutHeight = '200px';
    let length = 6;

    if (width < 1400) {
      // Small screens
      layoutWidth = '175px';
      layoutHeight = '175px';
      length = 3;
    }
    if (width < 768) {
      // Small screens
      layoutWidth = '150px';
      layoutHeight = '150px';
      length = 2;
    }

    // Only update the configuration if the length has changed
    if (
      !this.plainGalleryRow ||
      (this.plainGalleryRow.layout as GridLayout).breakConfig.length !== length
    ) {
      this.plainGalleryRow = {
        strategy: PlainGalleryStrategy.GRID,
        layout: new GridLayout(
          { width: layoutWidth, height: layoutHeight },
          { length, wrap: true }
        ),
      };

      this.libConfigPlainGallery.set({
        plainGalleryConfig: this.plainGalleryRow,
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
      currentImage: images[index],
    }) as ModalGalleryRef;
  }
}
