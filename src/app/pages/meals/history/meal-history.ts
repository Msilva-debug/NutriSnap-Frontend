import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Meal } from '../../../models/meal.model';
import { MealService } from '../../../services/meal.service';
import {
  getMealTypeIcon,
  getMealTypeLabel,
  MEAL_TYPE_OPTIONS,
} from '../../../utils/meal-types.util';

interface MealTypeSummary {
  type: Meal['type'];
  label: string;
  icon: string;
  meals: number;
  calories: number;
}

@Component({
  selector: 'app-meal-history',
  imports: [CommonModule, RouterLink],
  templateUrl: './meal-history.html',
  styles: ``,
})
export class MealHistory implements OnInit {
  private readonly mealService = inject(MealService);

  readonly selectedDate = signal(this.getTodayInputDate());
  readonly meals = signal<Meal[]>([]);
  readonly isLoadingMeals = signal(false);
  readonly mealsError = signal<string | null>(null);
  readonly todayInputDate = this.getTodayInputDate();
  readonly selectedDateLabel = computed(() => this.formatInputDate(this.selectedDate(), 'long'));
  readonly isTodaySelected = computed(() => this.selectedDate() === this.todayInputDate);

  ngOnInit(): void {
    this.loadMealsByDate();
  }

  get totalMeals(): number {
    return this.meals().length;
  }

  get totalCalories(): number {
    return this.meals().reduce((sum, meal) => sum + this.getMealCalories(meal), 0);
  }

  get totalProteins(): number {
    return this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.proteins), 0);
  }

  get totalCarbs(): number {
    return this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.carbs), 0);
  }

  get totalFats(): number {
    return this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.fats), 0);
  }

  get mealTypeSummaries(): MealTypeSummary[] {
    return MEAL_TYPE_OPTIONS.map((option) => {
      const meals = this.meals().filter((meal) => meal.type === option.value);

      return {
        type: option.value,
        label: option.label,
        icon: option.icon,
        meals: meals.length,
        calories: meals.reduce((sum, meal) => sum + this.getMealCalories(meal), 0),
      };
    });
  }

  refreshMeals(): void {
    this.loadMealsByDate();
  }

  changeDate(event: Event): void {
    const date = (event.target as HTMLInputElement).value;
    if (!date || date === this.selectedDate()) return;

    this.selectedDate.set(date);
    this.loadMealsByDate();
  }

  selectToday(): void {
    if (this.isTodaySelected()) return;

    this.selectedDate.set(this.todayInputDate);
    this.loadMealsByDate();
  }

  getMealTypeLabel(type: Meal['type']): string {
    return getMealTypeLabel(type);
  }

  getMealTypeIcon(type: Meal['type']): string {
    return getMealTypeIcon(type);
  }

  getMealTime(meal: Meal): string {
    if (meal.time) return meal.time;
    if (!meal.createdAt) return 'Sin hora';

    const date = new Date(meal.createdAt);
    if (Number.isNaN(date.getTime())) return 'Sin hora';

    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getMealDate(meal: Meal): string {
    const dateValue = meal.createdAt ?? meal.updatedAt;
    if (!dateValue) return this.selectedDateLabel();

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return this.selectedDateLabel();

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getMealCalories(meal: Meal): number {
    const calories = Number(meal.calories);

    return Number.isFinite(calories) ? calories : 0;
  }

  getMealMacro(value: number | undefined): number {
    const macro = Number(value);

    return Number.isFinite(macro) && macro > 0 ? macro : 0;
  }

  private loadMealsByDate(): void {
    this.isLoadingMeals.set(true);
    this.mealsError.set(null);

    this.mealService
      .findByDate(this.selectedDate())
      .pipe(finalize(() => this.isLoadingMeals.set(false)))
      .subscribe({
        next: (meals) => {
          this.meals.set(meals ?? []);
        },
        error: (error: HttpErrorResponse) => {
          this.meals.set([]);
          this.mealsError.set(this.getMealsErrorMessage(error));
        },
      });
  }

  private getMealsErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudieron cargar las comidas de la fecha seleccionada.';
  }

  private getTodayInputDate(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
  }

  private formatInputDate(value: string, format: 'short' | 'long'): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return date.toLocaleDateString('es-ES', {
      weekday: format === 'long' ? 'long' : undefined,
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: '2-digit',
    });
  }
}
