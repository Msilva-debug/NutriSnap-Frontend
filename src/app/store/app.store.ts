import { computed, Injectable, signal } from '@angular/core';
import { NutritionPlan } from '../models/nutrition-plan.model';

export interface AppState {
  nutritionPlan: NutritionPlan | null;
  isLoadingNutritionPlan: boolean;
  nutritionPlanError: string | null;
}

export type AppAction =
  | { type: 'nutritionPlan/loadStart' }
  | { type: 'nutritionPlan/loadSuccess'; nutritionPlan: NutritionPlan }
  | { type: 'nutritionPlan/loadFailure'; error: string }
  | { type: 'auth/logout' };

const initialState: AppState = {
  nutritionPlan: null,
  isLoadingNutritionPlan: false,
  nutritionPlanError: null,
};

const nutritionPlanStorageKey = 'nutrition_plan';

function getInitialState(): AppState {
  return {
    ...initialState,
    nutritionPlan: getStoredNutritionPlan(),
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

  dispatch(action: AppAction): void {
    this.state.update((state) => {
      const nextState = appReducer(state, action);

      if (
        action.type === 'nutritionPlan/loadSuccess'
        || action.type === 'nutritionPlan/loadFailure'
        || action.type === 'auth/logout'
      ) {
        persistNutritionPlan(nextState.nutritionPlan);
      }

      return nextState;
    });
  }
}
