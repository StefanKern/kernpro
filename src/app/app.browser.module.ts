import { AppComponent } from './components/app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';

@NgModule({
    bootstrap: [AppComponent],
    imports: [
        AppModule,
    ],
    providers: [
    ]
})
export class AppBrowserModule { }
