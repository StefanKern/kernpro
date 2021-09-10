import { WordcloudComponent } from './wordcloud/wordcloud.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [
    WordcloudComponent
  ],
  exports: [
    WordcloudComponent
  ],
  imports: [
    CommonModule
  ]
})
export class KernproLibsModule { }
