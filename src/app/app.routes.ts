import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then((m) => m.Register),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'meals',
        loadChildren: () => import('./pages/meals/meals.routes').then((m) => m.mealsRoutes),
      },
      {
        path: 'recommendations',
        loadComponent: () =>
          import('./pages/recommendations/recommendations').then((m) => m.Recommendations),
      },
      {
        path: 'food-preparations',
        loadComponent: () =>
          import('./pages/food-preparations/food-preparations').then(
            (m) => m.FoodPreparations,
          ),
      },
      {
        path: 'configuration',
        loadComponent: () =>
          import('./pages/configuration/configuration').then((m) => m.Configuration),
      },
    ],
  },
];
