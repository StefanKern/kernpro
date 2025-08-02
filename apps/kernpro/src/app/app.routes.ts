import { Routes } from '@angular/router';
import { StartpageComponent } from './pages/startpage/startpage.component';

export const routes: Routes = [
  { path: '', component: StartpageComponent, pathMatch: 'full' },
  {
    path: 'wordcloud',
    children: [
      {
        path: 'test',
        loadComponent: () =>
          import('wordcloud-tests').then((m) => m.WordcloudTestComponent),
        title: 'Wordcloud Test - Basic',
      },
      {
        path: 'test-custom-loader',
        loadComponent: () =>
          import('wordcloud-tests').then(
            (m) => m.WordcloudTestWithCustomLoaderComponent
          ),
        title: 'Wordcloud Test - Custom Loader',
      },
      { path: '', redirectTo: 'test', pathMatch: 'full' },
    ],
  },
];
