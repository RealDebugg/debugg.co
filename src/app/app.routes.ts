import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';
import { MainLayout } from './layouts/main-layout/main-layout';
import { RedirectComponent } from './pages/redirect/redirect';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'invite', component: RedirectComponent, data: { url: 'https://discord.gg/' } },
    ],
  },
  { path: '**', component: NotFound },
];
