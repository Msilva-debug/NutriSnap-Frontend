import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodAnalysisResult } from '../../../../models/meal.model';
import { AuthService } from '../../../../services/auth.service';
import { RuntimeConfigService } from '../../../../services/runtime-config.service';

export interface ActivityLevel {
  id: number;
  value: string;
  label: string;
  description: string;
}

export interface MealDescriptionAnalysisRequest {
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class NutritionAnalysisService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private runtimeConfig: RuntimeConfigService,
  ) {}

  analyzeImage(image: File, description?: string): Observable<FoodAnalysisResult> {
    const formData = new FormData();
    formData.append('image', image);

    if (description?.trim()) {
      formData.append('description', description.trim());
    }

    return this.http.post<FoodAnalysisResult>(this.runtimeConfig.apiUrl('/meal/analyze-image'), formData, {
      headers: this.getAuthHeaders(),
    });
  }

  analyzeDescription(request: MealDescriptionAnalysisRequest): Observable<FoodAnalysisResult> {
    return this.http.post<FoodAnalysisResult>(
      this.runtimeConfig.apiUrl('/meal/analyze-description'),
      request,
      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  getActivityLevels(): Observable<ActivityLevel[]> {
    return this.http.get<ActivityLevel[]>(this.runtimeConfig.apiUrl('/activity-levels'));
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
