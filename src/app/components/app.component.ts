import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainNavComponent } from './main-nav/main-nav.component';

@Component({
    selector: 'core-root',
    templateUrl: './app.component.html',
    imports: [CommonModule, RouterModule, MainNavComponent]
})
export class AppComponent {  
}
