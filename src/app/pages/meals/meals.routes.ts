import { Routes } from '@angular/router';
import { MealsLayout } from './layouts/meals-layout';

export const mealsRoutes: Routes = [
  {
    path: '',
    component: MealsLayout,
    children: [
      { path: '', redirectTo: 'add', pathMatch: 'full' },
      {
        path: 'add',
        loadComponent: () => import('./add-meal/add-meal').then((m) => m.AddMeal),
      },
      {
        path: 'history',
        loadComponent: () => import('./history/meal-history').then((m) => m.MealHistory),
      },
    ],
  },
];
