import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StartpageComponent } from './components/startpage/startpage.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';

const appRoutes: Routes = [
  { path: '', component: StartpageComponent},
  { path: '**', component: PagenotfoundComponent }
];

@NgModule({
  imports: [
    CommonModule,    
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  declarations: [],  
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
