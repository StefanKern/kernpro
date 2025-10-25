import { Routes } from '@angular/router';
import { StartpageComponent } from './pages/startpage/startpage.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: StartpageComponent, pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Login',
  },
  {
    path: 'scraped-sites',
    loadComponent: () => import('./pages/scraped-sites/scraped-sites').then((m) => m.ScrapedSites),
    title: 'Scraped Job Sites',
    canActivate: [authGuard], // Protected route
  },
  {
    path: 'wordcloud',
    children: [
      {
        path: 'test',
        loadComponent: () => import('wordcloud-tests').then((m) => m.WordcloudTestComponent),
        title: 'Wordcloud Test - Basic',
      },
      {
        path: 'test-custom-loader',
        loadComponent: () => import('wordcloud-tests').then((m) => m.WordcloudTestWithCustomLoaderComponent),
        title: 'Wordcloud Test - Custom Loader',
      },
      { path: '', redirectTo: 'test', pathMatch: 'full' },
    ],
  },
];
