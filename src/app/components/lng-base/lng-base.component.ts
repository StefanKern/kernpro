import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [RouterModule]
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
