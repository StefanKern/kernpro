import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  template: '<router-outlet></router-outlet>'
})
export class LngBaseComponent {

  constructor(private translate: TranslateService, activatedRoute: ActivatedRoute) {
    translate.addLangs(['en', 'de']);
    translate.setDefaultLang('en');
    const urlLng = activatedRoute.snapshot.routeConfig.path;
    if(urlLng)
      this.translate.use(urlLng);
  }
}
