import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material-module';

@Component({
    selector: 'core-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.scss'],
    imports: [
        MaterialModule
    ]
})
export class ContactComponent{
}
