import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { NutritionPlan } from '../models/nutrition-plan.model';
import { AppStore } from '../store/app.store';
import { NutritionPlanService } from './nutrition-plan.service';

@Injectable({
  providedIn: 'root',
})
export class NutritionPlanStateService {
  private readonly nutritionPlanService = inject(NutritionPlanService);
  private readonly store = inject(AppStore);

  readonly nutritionPlan = this.store.nutritionPlan;
  readonly isLoadingNutritionPlan = this.store.isLoadingNutritionPlan;
  readonly nutritionPlanError = this.store.nutritionPlanError;

  loadMine(): Observable<NutritionPlan | null> {
    this.store.dispatch({ type: 'nutritionPlan/loadStart' });

    return this.nutritionPlanService.findMine().pipe(
      tap((nutritionPlan) => {
        this.store.dispatch({
          type: 'nutritionPlan/loadSuccess',
          nutritionPlan,
        });
      }),
      catchError((error: HttpErrorResponse) => {
        this.store.dispatch({
          type: 'nutritionPlan/loadFailure',
          error: this.getNutritionPlanErrorMessage(error),
        });

        return of(null);
      }),
    );
  }

  ensureMineLoaded(): Observable<NutritionPlan | null> {
    const nutritionPlan = this.nutritionPlan();

    if (nutritionPlan) {
      return of(nutritionPlan);
    }

    return this.loadMine();
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
}
