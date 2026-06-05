import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Meal } from '../../models/meal.model';
import { MealService } from '../../services/meal.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  Math = Math;
  meals = signal<Meal[]>([]);
  isLoadingMeals = signal(false);
  mealsError = signal<string | null>(null);

  todayDate = signal(new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  calorieGoal = 2000;

  constructor(private mealService: MealService) {}

  ngOnInit(): void {
    this.loadTodayMeals();
  }

  get totalCalories() {
    return this.meals().reduce((sum, meal) => sum + this.getMealCalories(meal), 0);
  }

  get remainingCalories() {
    return this.calorieGoal - this.totalCalories;
  }

  get caloriePercentage() {
    return (this.totalCalories / this.calorieGoal) * 100;
  }

  get calorieProgressPercentage() {
    return Math.min(Math.max(this.caloriePercentage, 0), 100);
  }

  get mealsByType() {
    const types: { [key: string]: Meal[] } = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    this.meals().forEach(meal => {
      types[meal.type]?.push(meal);
    });
    return types;
  }

  loadTodayMeals(): void {
    this.isLoadingMeals.set(true);
    this.mealsError.set(null);

    this.mealService
      .findToday()
      .pipe(finalize(() => this.isLoadingMeals.set(false)))
      .subscribe({
        next: (meals) => this.meals.set(meals ?? []),
        error: (error: HttpErrorResponse) => {
          this.meals.set([]);
          this.mealsError.set(this.getMealsErrorMessage(error));
        },
      });
  }

  getMealTime(meal: Meal): string {
    if (meal.time) return meal.time;
    if (!meal.createdAt) return 'Sin hora';

    const createdAt = new Date(meal.createdAt);
    if (Number.isNaN(createdAt.getTime())) return 'Sin hora';

    return createdAt.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getCaloriesByType(type: Meal['type']): number {
    return this.mealsByType[type].reduce((sum, meal) => sum + this.getMealCalories(meal), 0);
  }

  addMeal(meal: Meal) {
    this.meals.update(current => [meal, ...current]);
  }

  deleteMeal(mealId?: string) {
    if (!mealId) return;

    this.meals.update(current => current.filter(m => m.id !== mealId));
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

  private getMealCalories(meal: Meal): number {
    const calories = Number(meal.calories);

    return Number.isFinite(calories) ? calories : 0;
  }
}
