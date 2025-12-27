import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  { path: '', component: MainLayout, children: [{ path: '', component: Home }] },
  { path: '**', component: NotFound },
];
