import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatNavList } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ContactComponent } from './contact/contact.component';

@Component({
    selector: 'core-main-nav',
    templateUrl: './main-nav.component.html',
    styleUrls: ['./main-nav.component.scss'],
    imports: [
        ContactComponent,
        MatIconModule,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonToggleModule,
        MatNavList,
        AsyncPipe
    ]
})
export class MainNavComponent {
  selectedLng = 'de'

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver) {
  }

  onValChange(value) {
    // TODO: implement
  }
}
