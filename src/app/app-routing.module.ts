import { RouterModule, Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StartpageComponent} from './components/startpage/startpage.component';
import {PagenotfoundComponent} from './components/pagenotfound/pagenotfound.component';
import {SkillpageComponent} from './components/skillpage/skillpage.component';
import { UrlLangResolver } from './resolver/url-lang.resolver';

const browserLngString = (navigator.language as string).split('-')[0]
const browserLang = browserLngString.match(/en|de/) ? browserLngString : 'en';

const appRoutes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: browserLang},
  {
    path: ':lng',
    resolve: [UrlLangResolver],
    children: [
      {path: '', component: StartpageComponent, pathMatch: 'full'},
      {path: 'skill/:name', component: SkillpageComponent, pathMatch: 'full'},
      {path: '**', component: PagenotfoundComponent}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
