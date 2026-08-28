import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NutritionPlan } from '../models/nutrition-plan.model';
import { AuthService } from './auth.service';
import { RuntimeConfigService } from './runtime-config.service';

@Injectable({
  providedIn: 'root',
})
export class NutritionPlanService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private runtimeConfig: RuntimeConfigService,
  ) {}

  findMine(): Observable<NutritionPlan> {
    return this.http.get<NutritionPlan>(this.runtimeConfig.apiUrl('/nutrition-plan/me'), {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
