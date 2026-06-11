import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { Meal } from '../models/meal.model';
import { AppStore } from '../store/app.store';
import { MealService } from './meal.service';
import { MealSocketService } from './meal-socket.service';

@Injectable({
  providedIn: 'root',
})
export class MealStateService {
  private readonly mealService = inject(MealService);
  private readonly mealSocketService = inject(MealSocketService);
  private readonly store = inject(AppStore);

  readonly todayMeals = this.store.todayMeals;
  readonly todayMealsDate = this.store.todayMealsDate;
  readonly isLoadingTodayMeals = this.store.isLoadingTodayMeals;
  readonly todayMealsError = this.store.todayMealsError;

  loadToday(): Observable<Meal[]> {
    this.mealSocketService.connect();
    this.store.dispatch({ type: 'todayMeals/loadStart' });

    return this.mealService.findToday().pipe(
      tap((meals) => {
        this.store.dispatch({
          type: 'todayMeals/loadSuccess',
          meals: meals ?? [],
        });
      }),
      catchError((error: HttpErrorResponse) => {
        this.store.dispatch({
          type: 'todayMeals/loadFailure',
          error: this.getMealsErrorMessage(error),
        });

        return of([]);
      }),
    );
  }

  addTodayMeal(meal: Meal): void {
    this.mealSocketService.connect();
    this.store.dispatch({ type: 'todayMeals/add', meal });
  }

  ensureTodayLoaded(): Observable<Meal[]> {
    this.mealSocketService.connect();

    if (this.todayMealsDate() === this.getTodayStorageDate()) {
      return of(this.todayMeals());
    }

    return this.loadToday();
  }

  deleteTodayMeal(mealId: string): Observable<unknown> {
    return this.mealService.deleteMeal(mealId).pipe(
      tap(() => {
        this.store.dispatch({ type: 'todayMeals/remove', mealId });
      }),
    );
  }

  private getMealsErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudieron cargar las comidas de hoy. Intenta nuevamente.';
  }

  private getTodayStorageDate(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
  }
}
