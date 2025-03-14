import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContactComponent } from './contact/contact.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatNavList } from '@angular/material/list';
import { AsyncPipe } from '@angular/common';

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
        TranslateModule,
        AsyncPipe
    ]
})
export class MainNavComponent {
  selectedLng = 'de'

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, private router: Router,
    translate: TranslateService) {
      translate.onLangChange.subscribe(langChangeEvent => this.selectedLng = langChangeEvent.lang)
  }


  onValChange(value) {
    this.router.navigate([value]);
  }
}
