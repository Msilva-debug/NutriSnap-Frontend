import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Meal } from '../../models/meal.model';
import { NutritionPlan } from '../../models/nutrition-plan.model';
import { MealService } from '../../services/meal.service';
import { NutritionPlanService } from '../../services/nutrition-plan.service';

interface MacroStat {
  label: string;
  consumed: number;
  goal: number;
  percentage: number;
  progress: number;
  fillClass: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard implements OnInit {
  Math = Math;
  meals = signal<Meal[]>([]);
  nutritionPlan = signal<NutritionPlan | null>(null);
  isLoadingMeals = signal(false);
  isLoadingNutritionPlan = signal(false);
  mealsError = signal<string | null>(null);
  nutritionPlanError = signal<string | null>(null);

  todayDate = signal(new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  private readonly fallbackCalorieGoal = 2000;

  constructor(
    private mealService: MealService,
    private nutritionPlanService: NutritionPlanService,
  ) {}

  ngOnInit(): void {
    this.loadTodayMeals();
    this.loadNutritionPlan();
  }

  get totalCalories() {
    return this.meals().reduce((sum, meal) => sum + this.getMealCalories(meal), 0);
  }

  get totalProteins() {
    return this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.proteins), 0);
  }

  get totalCarbs() {
    return this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.carbs), 0);
  }

  get totalFats() {
    return this.meals().reduce((sum, meal) => sum + this.getMealMacro(meal.fats), 0);
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
        fillClass: 'bg-primary-100',
      },
      {
        label: 'Carbohidratos',
        consumed: this.totalCarbs,
        goal: carbsGoal,
        percentage: this.getPercentage(this.totalCarbs, carbsGoal),
        progress: this.getProgressPercentage(this.totalCarbs, carbsGoal),
        fillClass: 'bg-primary-200',
      },
      {
        label: 'Grasas',
        consumed: this.totalFats,
        goal: fatsGoal,
        percentage: this.getPercentage(this.totalFats, fatsGoal),
        progress: this.getProgressPercentage(this.totalFats, fatsGoal),
        fillClass: 'bg-accent-500',
      },
    ];
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

  loadNutritionPlan(): void {
    this.isLoadingNutritionPlan.set(true);
    this.nutritionPlanError.set(null);

    this.nutritionPlanService
      .findMine()
      .pipe(finalize(() => this.isLoadingNutritionPlan.set(false)))
      .subscribe({
        next: (nutritionPlan) => this.nutritionPlan.set(nutritionPlan),
        error: (error: HttpErrorResponse) => {
          this.nutritionPlan.set(null);
          this.nutritionPlanError.set(this.getNutritionPlanErrorMessage(error));
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

  private getNutritionPlanErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'No encontramos tu plan nutricional. Se usará una meta temporal.';
    }

    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudo cargar tu plan nutricional. Se usará una meta temporal.';
  }

  private getMealCalories(meal: Meal): number {
    const calories = Number(meal.calories);

    return Number.isFinite(calories) ? calories : 0;
  }

  private getMealMacro(value: number | undefined): number {
    const macro = Number(value);

    return Number.isFinite(macro) && macro > 0 ? macro : 0;
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
}
