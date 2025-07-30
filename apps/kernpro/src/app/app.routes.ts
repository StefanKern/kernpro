import { Routes } from '@angular/router';
import { StartpageComponent } from './pages/startpage/startpage.component';

export const routes: Routes = [
  { path: '', component: StartpageComponent, pathMatch: 'full' },
  {
    path: 'wordcloud-test',
    loadComponent: () =>
      import('@kernpro/wordcloud').then(
        (m) => m.WordcloudTestComponent
      ),
    title: 'Wordcloud Test',
  }
];
