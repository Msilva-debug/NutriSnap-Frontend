import { Meal } from '../models/meal.model';

export type MealType = Meal['type'];

export interface MealTypeOption {
  value: MealType;
  label: string;
  icon: string;
}

export const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: 'Desayuno', icon: '🌅' },
  { value: 'lunch', label: 'Almuerzo', icon: '☀️' },
  { value: 'dinner', label: 'Cena', icon: '🌙' },
  { value: 'snack', label: 'Merienda', icon: '🍎' },
] as const satisfies readonly MealTypeOption[];

export function getMealTypeOption(type: MealType): MealTypeOption {
  return MEAL_TYPE_OPTIONS.find((option) => option.value === type)!;
}

export function getMealTypeLabel(type: MealType): string {
  return getMealTypeOption(type).label;
}

export function getMealTypeIcon(type: MealType): string {
  return getMealTypeOption(type).icon;
}
