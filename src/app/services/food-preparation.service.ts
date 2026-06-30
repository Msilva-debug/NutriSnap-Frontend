import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  FoodPreparation,
  FoodPreparationAnalysisRequest,
  FoodPreparationForm,
  FoodPreparationMealRequest,
} from '../models/food-preparation.model';
import { Meal } from '../models/meal.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FoodPreparationService {
  private readonly foodPreparationsUrl = `${environment.urlBackend.replace(/\/$/, '')}/food-preparations`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  analyze(request: FoodPreparationAnalysisRequest): Observable<FoodPreparationForm> {
    return this.http.post<FoodPreparationForm>(`${this.foodPreparationsUrl}/analyze`, request, {
      headers: this.getAuthHeaders(),
    });
  }

  create(request: FoodPreparationForm): Observable<FoodPreparation> {
    return this.http.post<FoodPreparation>(this.foodPreparationsUrl, request, {
      headers: this.getAuthHeaders(),
    });
  }

  findAll(): Observable<FoodPreparation[]> {
    return this.http.get<FoodPreparation[]>(this.foodPreparationsUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  findOne(id: number): Observable<FoodPreparation> {
    return this.http.get<FoodPreparation>(`${this.foodPreparationsUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  update(id: number, request: FoodPreparationForm): Observable<FoodPreparation> {
    return this.http.patch<FoodPreparation>(`${this.foodPreparationsUrl}/${id}`, request, {
      headers: this.getAuthHeaders(),
    });
  }

  deactivate(id: number): Observable<unknown> {
    return this.http.delete(`${this.foodPreparationsUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }

  registerAsMeal(id: number, request: FoodPreparationMealRequest): Observable<Meal> {
    return this.http.post<Meal>(`${this.foodPreparationsUrl}/${id}/meal`, request, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
