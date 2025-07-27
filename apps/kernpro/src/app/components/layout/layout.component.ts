import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'core-main-nav',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatListModule,
    MatDividerModule,
    ContactComponent,
    MatButtonModule,
    RouterModule,
  ],
  standalone: true,
})
export class LayoutComponent implements OnInit {
  isOpen = signal(false);
  currentLang = signal('de');
  viewportScroller = inject(ViewportScroller);
  isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  ngOnInit() {
    if (this.isPlatformBrowser) {
      this.currentLang.set(window.location.pathname.split('/')[1] || 'de');
    }
  }

  navigateToSection(sectionId: string) {
    this.isOpen.set(false);
    this.viewportScroller.scrollToAnchor(sectionId);
  }

  changeLanguage(lang: string) {
    this.currentLang.set(lang);
    // Use direct URL navigation instead of Angular router
    window.location.href = `/${lang}`;
    this.isOpen.set(false);
  }
}
