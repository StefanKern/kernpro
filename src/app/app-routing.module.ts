import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { provideRouter, RouterModule, Routes, withComponentInputBinding } from '@angular/router';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { SkillpageComponent } from './components/skillpage/content/skillpage.component';
import { SidetreemenuComponent } from './components/skillpage/sidetreemenu/sidetreemenu.component';
import { StartpageComponent } from './components/startpage/startpage.component';

const appRoutes: Routes = [
  {path: '', component: StartpageComponent, pathMatch: 'full'},
  { path: 'skill', component: SidetreemenuComponent, children: [
    { path: ':name', component: SkillpageComponent }
  ]},
  {path: '**', component: PagenotfoundComponent}
];

@NgModule({
  imports: [
    CommonModule
  ],
  providers:[
    provideRouter(appRoutes, withComponentInputBinding())
  ],
  declarations: [],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
