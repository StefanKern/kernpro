import { RouterModule, Routes } from '@angular/router';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StartpageComponent} from './components/startpage/startpage.component';
import {PagenotfoundComponent} from './components/pagenotfound/pagenotfound.component';
import {SkillpageComponent} from './components/skillpage/skillpage.component';

const appRoutes: Routes = [
  {path: '', component: StartpageComponent, pathMatch: 'full'},
  {path: 'skill/:name', component: SkillpageComponent, pathMatch: 'full'},
  {path: '**', component: PagenotfoundComponent}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })
  ],
  declarations: [],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
