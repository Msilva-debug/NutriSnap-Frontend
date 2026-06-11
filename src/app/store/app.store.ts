import { computed, Injectable, signal } from '@angular/core';
import { Meal } from '../models/meal.model';
import { NutritionPlan } from '../models/nutrition-plan.model';

export interface AppState {
  nutritionPlan: NutritionPlan | null;
  isLoadingNutritionPlan: boolean;
  nutritionPlanError: string | null;
  todayMeals: Meal[];
  todayMealsDate: string | null;
  isLoadingTodayMeals: boolean;
  todayMealsError: string | null;
}

export type AppAction =
  | { type: 'nutritionPlan/loadStart' }
  | { type: 'nutritionPlan/loadSuccess'; nutritionPlan: NutritionPlan }
  | { type: 'nutritionPlan/loadFailure'; error: string }
  | { type: 'todayMeals/loadStart' }
  | { type: 'todayMeals/loadSuccess'; meals: Meal[] }
  | { type: 'todayMeals/loadFailure'; error: string }
  | { type: 'todayMeals/add'; meal: Meal }
  | { type: 'todayMeals/remove'; mealId: string }
  | { type: 'auth/logout' };

const initialState: AppState = {
  nutritionPlan: null,
  isLoadingNutritionPlan: false,
  nutritionPlanError: null,
  todayMeals: [],
  todayMealsDate: null,
  isLoadingTodayMeals: false,
  todayMealsError: null,
};

const nutritionPlanStorageKey = 'nutrition_plan';
const todayMealsStorageKey = 'today_meals';

interface StoredTodayMeals {
  date: string;
  meals: Meal[];
}

function getInitialState(): AppState {
  const storedTodayMeals = getStoredTodayMeals();

  return {
    ...initialState,
    nutritionPlan: getStoredNutritionPlan(),
    todayMeals: storedTodayMeals.meals,
    todayMealsDate: storedTodayMeals.date,
  };
}

function getStoredNutritionPlan(): NutritionPlan | null {
  if (typeof localStorage === 'undefined') return null;

  const storedNutritionPlan = localStorage.getItem(nutritionPlanStorageKey);
  if (!storedNutritionPlan) return null;

  try {
    return JSON.parse(storedNutritionPlan) as NutritionPlan;
  } catch {
    localStorage.removeItem(nutritionPlanStorageKey);
    return null;
  }
}

function persistNutritionPlan(nutritionPlan: NutritionPlan | null): void {
  if (typeof localStorage === 'undefined') return;

  if (!nutritionPlan) {
    localStorage.removeItem(nutritionPlanStorageKey);
    return;
  }

  localStorage.setItem(nutritionPlanStorageKey, JSON.stringify(nutritionPlan));
}

function getStoredTodayMeals(): { meals: Meal[]; date: string | null } {
  if (typeof localStorage === 'undefined') return { meals: [], date: null };

  const storedTodayMeals = localStorage.getItem(todayMealsStorageKey);
  if (!storedTodayMeals) return { meals: [], date: null };

  try {
    const parsed = JSON.parse(storedTodayMeals) as StoredTodayMeals;

    if (parsed.date !== getTodayStorageDate() || !Array.isArray(parsed.meals)) {
      localStorage.removeItem(todayMealsStorageKey);
      return { meals: [], date: null };
    }

    return {
      meals: parsed.meals,
      date: parsed.date,
    };
  } catch {
    localStorage.removeItem(todayMealsStorageKey);
    return { meals: [], date: null };
  }
}

function persistTodayMeals(meals: Meal[], date: string | null): void {
  if (typeof localStorage === 'undefined') return;

  if (!date) {
    localStorage.removeItem(todayMealsStorageKey);
    return;
  }

  localStorage.setItem(todayMealsStorageKey, JSON.stringify({ date, meals }));
}

function getTodayStorageDate(): string {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');

  return `${today.getFullYear()}-${month}-${day}`;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'nutritionPlan/loadStart':
      return {
        ...state,
        isLoadingNutritionPlan: true,
        nutritionPlanError: null,
      };

    case 'nutritionPlan/loadSuccess':
      return {
        ...state,
        nutritionPlan: action.nutritionPlan,
        isLoadingNutritionPlan: false,
        nutritionPlanError: null,
      };

    case 'nutritionPlan/loadFailure':
      return {
        ...state,
        nutritionPlan: null,
        isLoadingNutritionPlan: false,
        nutritionPlanError: action.error,
      };

    case 'todayMeals/loadStart':
      return {
        ...state,
        isLoadingTodayMeals: true,
        todayMealsError: null,
      };

    case 'todayMeals/loadSuccess':
      return {
        ...state,
        todayMeals: action.meals,
        todayMealsDate: getTodayStorageDate(),
        isLoadingTodayMeals: false,
        todayMealsError: null,
      };

    case 'todayMeals/loadFailure':
      return {
        ...state,
        todayMeals: [],
        todayMealsDate: null,
        isLoadingTodayMeals: false,
        todayMealsError: action.error,
      };

    case 'todayMeals/add': {
      const todayDate = getTodayStorageDate();
      const currentMeals = state.todayMealsDate === todayDate ? state.todayMeals : [];
      const mealId = action.meal.id;
      const mealsWithoutCurrent = mealId
        ? currentMeals.filter((meal) => String(meal.id) !== String(mealId))
        : currentMeals;

      return {
        ...state,
        todayMeals: [action.meal, ...mealsWithoutCurrent],
        todayMealsDate: todayDate,
        todayMealsError: null,
      };
    }

    case 'todayMeals/remove':
      return {
        ...state,
        todayMeals: state.todayMeals.filter((meal) => meal.id !== action.mealId),
        todayMealsDate: state.todayMealsDate ?? getTodayStorageDate(),
        todayMealsError: null,
      };

    case 'auth/logout':
      return initialState;

    default:
      return state;
  }
}

@Injectable({
  providedIn: 'root',
})
export class AppStore {
  private readonly state = signal<AppState>(getInitialState());

  readonly nutritionPlan = computed(() => this.state().nutritionPlan);
  readonly isLoadingNutritionPlan = computed(() => this.state().isLoadingNutritionPlan);
  readonly nutritionPlanError = computed(() => this.state().nutritionPlanError);
  readonly todayMeals = computed(() => this.state().todayMeals);
  readonly todayMealsDate = computed(() => this.state().todayMealsDate);
  readonly isLoadingTodayMeals = computed(() => this.state().isLoadingTodayMeals);
  readonly todayMealsError = computed(() => this.state().todayMealsError);

  dispatch(action: AppAction): void {
    this.state.update((state) => {
      const nextState = appReducer(state, action);

      if (
        action.type === 'nutritionPlan/loadSuccess' ||
        action.type === 'nutritionPlan/loadFailure' ||
        action.type === 'auth/logout'
      ) {
        persistNutritionPlan(nextState.nutritionPlan);
      }

      if (
        action.type === 'todayMeals/loadSuccess' ||
        action.type === 'todayMeals/loadFailure' ||
        action.type === 'todayMeals/add' ||
        action.type === 'todayMeals/remove' ||
        action.type === 'auth/logout'
      ) {
        persistTodayMeals(nextState.todayMeals, nextState.todayMealsDate);
      }

      return nextState;
    });
  }
}
