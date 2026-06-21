import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { routes } from './app.routes';

class AppTitleStrategy extends TitleStrategy {
  private readonly titleService = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.resolveTitle(snapshot);
    this.titleService.setTitle(title);
  }

  private resolveTitle(snapshot: RouterStateSnapshot): string {
    let route = snapshot.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const routeTitle = route.data['title'];

    if (routeTitle) {
      return `${routeTitle} | debugg.co`;
    }

    return 'debugg.co | I build cool stuff that inspires';
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideHttpClient(),
    provideAnimations(),
  ],
};
