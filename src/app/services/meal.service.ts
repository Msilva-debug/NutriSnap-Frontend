import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Meal } from '../models/meal.model';
import { AuthService } from './auth.service';
import { RuntimeConfigService } from './runtime-config.service';

export interface CreateMealRequest {
  name: string;
  calories: number;
  type: Meal['type'];
  proteins?: number;
  carbs?: number;
  fats?: number;
}

export interface SaveMealHistoryNoteRequest {
  date: string;
  note: string;
}

export interface MealHistoryResponse {
  date: string;
  meals: Meal[];
  note: string | null;
  noteId: number | null;
}

export interface SaveMealHistoryNoteResponse {
  date?: string;
  note?: string | null;
  noteId?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class MealService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private runtimeConfig: RuntimeConfigService,
  ) {}

  createMeal(createMealDto: CreateMealRequest): Observable<Meal> {
    return this.http.post<Meal>(this.runtimeConfig.apiUrl('/meal'), createMealDto, {
      headers: this.getAuthHeaders(),
    });
  }

  findToday(): Observable<Meal[]> {
    return this.http.get<Meal[]>(this.runtimeConfig.apiUrl('/meal/today'), {
      headers: this.getAuthHeaders(),
    });
  }

  findByDate(date: string): Observable<MealHistoryResponse> {
    return this.http.get<MealHistoryResponse>(this.runtimeConfig.apiUrl('/meal/history'), {
      params: { date },
      headers: this.getAuthHeaders(),
    });
  }

  deleteMeal(mealId: string): Observable<unknown> {
    return this.http.delete(this.runtimeConfig.apiUrl(`/meal/${mealId}`), {
      headers: this.getAuthHeaders(),
    });
  }

  saveHistoryNote(noteDto: SaveMealHistoryNoteRequest): Observable<SaveMealHistoryNoteResponse> {
    return this.http.patch<SaveMealHistoryNoteResponse>(this.runtimeConfig.apiUrl('/meal/history/note'), noteDto, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
