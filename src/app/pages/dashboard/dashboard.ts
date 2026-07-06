import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import {
  MealMacroDetail,
  MealMacroSummary,
} from '../../components/meal-macro-summary/meal-macro-summary';
import { NutrientOverageAlert } from '../../components/nutrient-overage-alert/nutrient-overage-alert';
import { Meal } from '../../models/meal.model';
import { MealStateService } from '../../services/meal-state.service';
import { NutritionPlanStateService } from '../../services/nutrition-plan-state.service';
import { getMealTypeIcon, getMealTypeLabel, MEAL_TYPE_OPTIONS } from '../../utils/meal-types.util';

interface MacroStat {
  label: string;
  consumed: number;
  goal: number;
  percentage: number;
  progress: number;
  overage: number;
  fillClass: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, LoadingSpinner, MealMacroSummary, NutrientOverageAlert],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  private readonly nutritionPlanState = inject(NutritionPlanStateService);
  private readonly mealState = inject(MealStateService);

  Math = Math;
  readonly meals = this.mealState.todayMeals;
  selectedMeal = signal<Meal | null>(null);
  readonly nutritionPlan = this.nutritionPlanState.nutritionPlan;
  // readonly isLoadingNutritionPlan = this.nutritionPlanState.isLoadingNutritionPlan;
  // readonly nutritionPlanError = this.nutritionPlanState.nutritionPlanError;
  readonly isLoadingMeals = this.mealState.isLoadingTodayMeals;
  readonly mealsError = this.mealState.todayMealsError;
  deletingMealIds = signal<Set<string>>(new Set());
  mealActionError = signal<string | null>(null);
  readonly mealTypeOptions = MEAL_TYPE_OPTIONS;

  todayDate = signal(
    new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

  private readonly fallbackCalorieGoal = 2000;

  ngOnInit(): void {
    forkJoin([
      this.nutritionPlanState.ensureMineLoaded(),
      this.mealState.ensureTodayLoaded(),
    ]).subscribe();
  }

  get totalCalories() {
    return this.meals().reduce((sum, meal) => sum + this.getMealCalories(meal), 0);
  }

  get totalProteins() {
    return this.roundMacro(
      this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.proteins), 0),
    );
  }

  get totalCarbs() {
    return this.roundMacro(
      this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.carbs), 0),
    );
  }

  get totalFats() {
    return this.roundMacro(
      this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.fats), 0),
    );
  }

  get calorieGoal() {
    return this.getPositiveNumber(this.nutritionPlan()?.dailyCalorieGoal, this.fallbackCalorieGoal);
  }

  get remainingCalories() {
    return this.calorieGoal - this.totalCalories;
  }

  get caloriePercentage() {
    return this.getPercentage(this.totalCalories, this.calorieGoal);
  }

  get calorieProgressPercentage() {
    return this.getProgressPercentage(this.totalCalories, this.calorieGoal);
  }

  get calorieOverage() {
    return Math.max(this.totalCalories - this.calorieGoal, 0);
  }

  get macroStats(): MacroStat[] {
    const proteinGoal = this.getMacroGoal(this.nutritionPlan()?.proteinGoal, 0.3, 4);
    const carbsGoal = this.getMacroGoal(this.nutritionPlan()?.carbsGoal, 0.45, 4);
    const fatsGoal = this.getMacroGoal(this.nutritionPlan()?.fatsGoal, 0.25, 9);

    return [
      {
        label: 'Proteína',
        consumed: this.totalProteins,
        goal: proteinGoal,
        percentage: this.getPercentage(this.totalProteins, proteinGoal),
        progress: this.getProgressPercentage(this.totalProteins, proteinGoal),
        overage: this.getOverage(this.totalProteins, proteinGoal),
        fillClass: 'bg-primary-500',
      },
      {
        label: 'Carbohidratos',
        consumed: this.totalCarbs,
        goal: carbsGoal,
        percentage: this.getPercentage(this.totalCarbs, carbsGoal),
        progress: this.getProgressPercentage(this.totalCarbs, carbsGoal),
        overage: this.getOverage(this.totalCarbs, carbsGoal),
        fillClass: 'bg-secondary-600',
      },
      {
        label: 'Grasas',
        consumed: this.totalFats,
        goal: fatsGoal,
        percentage: this.getPercentage(this.totalFats, fatsGoal),
        progress: this.getProgressPercentage(this.totalFats, fatsGoal),
        overage: this.getOverage(this.totalFats, fatsGoal),
        fillClass: 'bg-accent-600',
      },
    ];
  }

  get mealsByType() {
    const types = MEAL_TYPE_OPTIONS.reduce(
      (groupedMeals, option) => {
        groupedMeals[option.value] = [];
        return groupedMeals;
      },
      {} as Record<Meal['type'], Meal[]>,
    );

    this.meals().forEach((meal) => {
      types[meal.type]?.push(meal);
    });
    return types;
  }

  loadTodayMeals(): void {
    this.mealActionError.set(null);
    this.mealState.loadToday().subscribe();
  }

  openMealModal(meal: Meal): void {
    this.selectedMeal.set(meal);
  }

  @HostListener('document:keydown.escape')
  closeMealModal(): void {
    this.selectedMeal.set(null);
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

  getMealDate(meal: Meal): string {
    const dateValue = meal.createdAt ?? meal.updatedAt;
    if (!dateValue) return 'Fecha no disponible';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getMealTypeLabel(type: Meal['type']): string {
    return getMealTypeLabel(type);
  }

  getMealTypeIcon(type: Meal['type']): string {
    return getMealTypeIcon(type);
  }

  getMealMacroDetails(meal: Meal): MealMacroDetail[] {
    const macros = [
      {
        label: 'Proteínas',
        value: this.getMealMacro(meal.proteins),
        fillClass: 'bg-primary-500',
      },
      {
        label: 'Carbohidratos',
        value: this.getMealMacro(meal.carbs),
        fillClass: 'bg-secondary-600',
      },
      {
        label: 'Grasas',
        value: this.getMealMacro(meal.fats),
        fillClass: 'bg-accent-600',
      },
    ];
    const totalMacros = macros.reduce((sum, macro) => sum + macro.value, 0);

    return macros.map((macro) => ({
      ...macro,
      progress: totalMacros > 0 ? (macro.value / totalMacros) * 100 : 0,
    }));
  }

  getCaloriesByType(type: Meal['type']): number {
    return this.mealsByType[type].reduce((sum, meal) => sum + this.getMealCalories(meal), 0);
  }

  isDeletingMeal(mealId?: string): boolean {
    return !!mealId && this.deletingMealIds().has(mealId);
  }

  addMeal(meal: Meal) {
    this.mealState.addTodayMeal(meal);
  }

  deleteMeal(mealId?: string) {
    if (!mealId) return;

    this.mealActionError.set(null);
    this.deletingMealIds.update((current) => new Set(current).add(mealId));

    this.mealState
      .deleteTodayMeal(mealId)
      .pipe(
        finalize(() => {
          this.deletingMealIds.update((current) => {
            const next = new Set(current);
            next.delete(mealId);
            return next;
          });
        }),
      )
      .subscribe({
        next: () => {
          if (this.selectedMeal()?.id === mealId) {
            this.closeMealModal();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.mealActionError.set(this.getDeleteMealErrorMessage(error));
        },
      });
  }

  private getDeleteMealErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'No encontramos esa comida. Actualiza la lista e intenta nuevamente.';
    }

    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudo eliminar la comida. Intenta nuevamente.';
  }

  private getMealCalories(meal: Meal): number {
    const calories = Number(meal.calories);

    return Number.isFinite(calories) ? calories : 0;
  }

  private getMealMacro(value: number | undefined): number {
    const macro = Number(value);

    return Number.isFinite(macro) && macro > 0 ? this.roundMacro(macro) : 0;
  }

  private roundMacro(value: number): number {
    return Math.round((value + Number.EPSILON) * 10) / 10;
  }

  private getPositiveNumber(value: unknown, fallback = 0): number {
    const numberValue = Number(value);

    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : fallback;
  }

  private getMacroGoal(value: unknown, calorieRatio: number, caloriesPerGram: number): number {
    const planGoal = this.getPositiveNumber(value);
    if (planGoal > 0) return planGoal;

    return Math.round((this.calorieGoal * calorieRatio) / caloriesPerGram);
  }

  private getPercentage(consumed: number, goal: unknown): number {
    const goalValue = this.getPositiveNumber(goal);
    if (goalValue === 0) return 0;

    return (consumed / goalValue) * 100;
  }

  private getProgressPercentage(consumed: number, goal: unknown): number {
    return Math.min(Math.max(this.getPercentage(consumed, goal), 0), 100);
  }

  private getOverage(consumed: number, goal: unknown): number {
    const goalValue = this.getPositiveNumber(goal);

    return Math.max(consumed - goalValue, 0);
  }
}
