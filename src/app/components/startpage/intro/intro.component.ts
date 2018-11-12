import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, HostListener, ViewChild, ElementRef , Inject} from '@angular/core';
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";

@Component({
  selector: 'core-intro',
  templateUrl: './intro.component.html'
})
export class IntroComponent implements OnInit {
  @ViewChild("parallaximg") parallaximg: ElementRef;
  
  transformImgPos: SafeStyle;
  transformTextPos: SafeStyle;
  constructor(@Inject(WINDOW) private window: Window, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.transformImgPos = this.sanitizer.bypassSecurityTrustStyle(`translate(0,-100px) scale(1.5)`);
    this.transformTextPos = this.sanitizer.bypassSecurityTrustStyle(`translate(0,0)`);
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    let _transformImg = document.documentElement.scrollTop / 3 - 100;
    if (_transformImg > 100)
      _transformImg = 100;
    this.transformImgPos = this.sanitizer.bypassSecurityTrustStyle(`translate(0,${_transformImg}px) scale(1.5)`);


    let _transformText = document.documentElement.scrollTop / 6;
    if (_transformText > 100)
      _transformText = 100;
    this.transformTextPos = this.sanitizer.bypassSecurityTrustStyle(`translate(0,${_transformText}px)`);
  }
}
