export type UserGoal =
  | 'lose_fat'
  | 'gain_muscle'
  | 'body_recomposition'
  | 'maintain_weight'
  | 'improve_habits';

export interface NutritionPlan {
  id: number;
  userId: number;
  goal: UserGoal;
  basalMetabolicRate: number;
  maintenanceCalories: number;
  dailyCalorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  createdAt: string;
  updatedAt: string;
}
