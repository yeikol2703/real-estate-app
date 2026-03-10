import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  { path: 'catalog', loadComponent: () => import('./features/catalog/catalog.component').then((m) => m.CatalogComponent) },
  {
    path: 'catalog/:id',
    loadComponent: () =>
      import('./features/catalog/property-detail/property-detail.component').then((m) => m.PropertyDetailComponent),
  },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent) },
  { path: '**', redirectTo: '' },
];
