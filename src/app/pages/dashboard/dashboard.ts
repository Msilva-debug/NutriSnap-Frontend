import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meal } from '../../models/meal.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styles: ``,
})
export class Dashboard {
  Math = Math;
  meals = signal<Meal[]>([
    {
      id: '1',
      name: 'Desayuno: Huevos con tostadas',
      calories: 450,
      time: '07:30',
      type: 'breakfast',
    },
    {
      id: '2',
      name: 'Almuerzo: Pechuga de pollo con arroz',
      calories: 650,
      time: '12:45',
      type: 'lunch',
    },
  ]);

  todayDate = signal(new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  calorieGoal = 2000;

  get totalCalories() {
    return this.meals().reduce((sum, meal) => sum + meal.calories, 0);
  }

  get remainingCalories() {
    return this.calorieGoal - this.totalCalories;
  }

  get caloriePercentage() {
    return (this.totalCalories / this.calorieGoal) * 100;
  }

  get mealsByType() {
    const types: { [key: string]: Meal[] } = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };
    this.meals().forEach(meal => {
      types[meal.type].push(meal);
    });
    return types;
  }

  addMeal(meal: Meal) {
    this.meals.update(current => [meal, ...current]);
  }

  deleteMeal(mealId?: string) {
    if (!mealId) return;

    this.meals.update(current => current.filter(m => m.id !== mealId));
  }
}
