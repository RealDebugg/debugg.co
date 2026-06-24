import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';
import { MainLayout } from './layouts/main-layout/main-layout';
import { RedirectComponent } from './pages/redirect/redirect';
import { Blog } from './pages/blog/blog';
import { Contact } from './pages/contact/contact';
import { Links } from './pages/links/links';
import { Resume } from './pages/resume/resume';
import { Status } from './pages/status/status';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home, data: { title: 'Home' } },
      { path: 'blog', component: Blog, data: { title: 'Blog' } },
      { path: 'contact', component: Contact, data: { title: 'Contact me' } },
      { path: 'links', component: Links, data: { title: 'Useful links' } },
      { path: 'resume', component: Resume, data: { title: 'Resume' } },
      { path: 'activity', component: Status, data: { title: 'Activity' } },
      {
        path: 'invite',
        component: RedirectComponent,
        data: {
          url: 'https://discord.gg/7Snv7rxtMY',
          title: 'Invite',
        },
      },
    ],
  },
  { path: '**', component: NotFound, data: { title: 'Not Found' } },
];
