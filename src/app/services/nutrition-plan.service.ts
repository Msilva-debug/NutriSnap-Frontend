import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NutritionPlan } from '../models/nutrition-plan.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class NutritionPlanService {
  private readonly nutritionPlanUrl = `${environment.urlBackend.replace(/\/$/, '')}/nutrition-plan`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  findMine(): Observable<NutritionPlan> {
    return this.http.get<NutritionPlan>(`${this.nutritionPlanUrl}/me`, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
