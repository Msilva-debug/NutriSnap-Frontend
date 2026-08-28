import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  FoodPreparation,
  FoodPreparationAnalysisRequest,
  FoodPreparationForm,
  FoodPreparationMealRequest,
} from '../models/food-preparation.model';
import { Meal } from '../models/meal.model';
import { AuthService } from './auth.service';
import { RuntimeConfigService } from './runtime-config.service';

@Injectable({
  providedIn: 'root',
})
export class FoodPreparationService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private runtimeConfig: RuntimeConfigService,
  ) {}

  analyze(request: FoodPreparationAnalysisRequest): Observable<FoodPreparationForm> {
    return this.http.post<FoodPreparationForm>(this.runtimeConfig.apiUrl('/food-preparations/analyze'), request, {
      headers: this.getAuthHeaders(),
    });
  }

  create(request: FoodPreparationForm): Observable<FoodPreparation> {
    return this.http.post<FoodPreparation>(this.runtimeConfig.apiUrl('/food-preparations'), request, {
      headers: this.getAuthHeaders(),
    });
  }

  findAll(): Observable<FoodPreparation[]> {
    return this.http.get<FoodPreparation[]>(this.runtimeConfig.apiUrl('/food-preparations'), {
      headers: this.getAuthHeaders(),
    });
  }

  findOne(id: number): Observable<FoodPreparation> {
    return this.http.get<FoodPreparation>(this.runtimeConfig.apiUrl(`/food-preparations/${id}`), {
      headers: this.getAuthHeaders(),
    });
  }

  update(id: number, request: FoodPreparationForm): Observable<FoodPreparation> {
    return this.http.patch<FoodPreparation>(this.runtimeConfig.apiUrl(`/food-preparations/${id}`), request, {
      headers: this.getAuthHeaders(),
    });
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.delete(this.runtimeConfig.apiUrl(`/food-preparations/${id}`), {
      headers: this.getAuthHeaders(),
    });
  }

  registerAsMeal(id: number, request: FoodPreparationMealRequest): Observable<Meal> {
    return this.http.post<Meal>(this.runtimeConfig.apiUrl(`/food-preparations/${id}/meal`), request, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
