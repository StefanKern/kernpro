import { AppComponent } from './components/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';

@NgModule({
  bootstrap: [AppComponent],
  imports: [
    AppModule,
  ],
  providers: [
    provideClientHydration()
  ]
})
export class AppBrowserModule { }
