import { Meal } from './meal.model';

export interface FoodPreparationAnalysisRequest {
  description: string;
  servings?: number;
}

export interface FoodPreparationForm {
  name: string;
  description: string;
  servings: number;
  caloriesPerServing: number;
  proteinsPerServing: number;
  carbsPerServing: number;
  fatsPerServing: number;
  micronutrients: string;
  notes: string;
}

export interface FoodPreparation extends FoodPreparationForm {
  id: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FoodPreparationMealRequest {
  type: Meal['type'];
  servings?: number;
}
