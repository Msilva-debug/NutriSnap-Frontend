export interface Meal {
  id?: string;
  name: string;
  calories: number;
  time?: string;
  createdAt?: string;
  updatedAt?: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  proteins?: number;
  carbs?: number;
  fats?: number;
}

export interface FoodAnalysisResult {
  name: string;
  calories: number;
  proteins_g: number;
  carbs_g: number;
  fats_g: number;
  micronutrients: string;
}
