import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { RuntimeConfigService } from './runtime-config.service';

export type RecommendationPeriod = 'daily' | 'range';

export type RecommendationFilter =
  | {
      period: 'daily';
      date: string;
    }
  | {
      period: 'range';
      startDate: string;
      endDate: string;
    };

export interface RecommendationItem {
  title: string;
  description: string;
  category?: string;
}

export type RecommendationComparisonPoint =
  | string
  | {
      title?: string;
      description?: string;
      category?: string;
    };

export interface RecommendationComparison {
  available: boolean;
  summary?: string;
  improvements?: RecommendationComparisonPoint[];
  needsAttention?: RecommendationComparisonPoint[];
  stablePatterns?: RecommendationComparisonPoint[];
}

export interface RecommendationsResponse {
  period: RecommendationPeriod;
  comparison?: RecommendationComparison;
  summary?: string;
  recommendations: RecommendationItem[];
}

@Injectable({
  providedIn: 'root',
})
export class RecommendationsService {
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private runtimeConfig: RuntimeConfigService,
  ) {}

  findByFilter(filter: RecommendationFilter): Observable<RecommendationsResponse> {
    return this.http.get<RecommendationsResponse>(this.runtimeConfig.apiUrl('/recommendations'), {
      params: this.buildParams(filter),
      headers: this.getAuthHeaders(),
    });
  }

  private buildParams(filter: RecommendationFilter): HttpParams {
    let params = new HttpParams().set('period', filter.period);

    if (filter.period === 'daily') {
      return params.set('date', filter.date);
    }

    params = params.set('startDate', filter.startDate);

    return params.set('endDate', filter.endDate);
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
