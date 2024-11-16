import { LngBaseComponent } from './components/lng-base/lng-base.component';
import { RouterModule, Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StartpageComponent} from './components/startpage/startpage.component';
import {PagenotfoundComponent} from './components/pagenotfound/pagenotfound.component';
import {SkillpageComponent} from './components/skillpage/content/skillpage.component';
import { SidetreemenuComponent } from './components/skillpage/sidetreemenu/sidetreemenu.component';

const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
const browserLngString = isBrowser ? (navigator.language as string).split('-')[0] : 'en';
const browserLang = browserLngString.match(/en|de/) ? browserLngString : 'en';

const childRoutes: Routes = [
  {path: '', component: StartpageComponent, pathMatch: 'full'},
  { path: 'skill', component: SidetreemenuComponent, children: [
    { path: ':name', component: SkillpageComponent }
  ]},
  {path: '**', component: PagenotfoundComponent}
];

const appRoutes: Routes = [
  {path: '', pathMatch: 'full', redirectTo: browserLang},
  {path: 'en', component: LngBaseComponent, children: childRoutes},
  {path: 'de', component: LngBaseComponent, children: childRoutes},
  {path: '**', redirectTo: browserLang}
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
