import { CommonModule } from '@angular/common';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';

// for firebase db
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';

import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './components/app.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { StartPageModule } from './components/startpage/startpage.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase, 'kernpro'),
    StartPageModule,
    MainNavComponent,
    RouterOutlet
  ],
  providers: [
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideExperimentalZonelessChangeDetection(),
  ]
})
export class AppModule { }


