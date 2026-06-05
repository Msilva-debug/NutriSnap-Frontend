import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Meal } from '../models/meal.model';
import { AuthService } from './auth.service';

export interface CreateMealRequest {
  name: string;
  calories: number;
  type: Meal['type'];
  proteins?: number;
  carbs?: number;
  fats?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private readonly mealUrl = `${environment.urlBackend.replace(/\/$/, '')}/meal`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  createMeal(createMealDto: CreateMealRequest): Observable<Meal> {
    const token = this.authService.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return this.http.post<Meal>(this.mealUrl, createMealDto, { headers });
  }
}
