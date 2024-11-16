import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material-module';

@Component({
  selector: 'core-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    MaterialModule
  ]
})
export class ContactComponent{
}
