import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export type RecommendationPeriod = 'daily' | 'monthly' | 'range';

export type RecommendationFilter =
  | {
      period: 'daily';
      date: string;
    }
  | {
      period: 'monthly';
      month: string;
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

export interface RecommendationsResponse {
  period: RecommendationPeriod;
  summary?: string;
  recommendations: RecommendationItem[];
}

@Injectable({
  providedIn: 'root',
})
export class RecommendationsService {
  readonly recommendationsUrl = `${environment.urlBackend.replace(/\/$/, '')}/recommendations`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  findByFilter(filter: RecommendationFilter): Observable<RecommendationsResponse> {
    return this.http.get<RecommendationsResponse>(this.recommendationsUrl, {
      params: this.buildParams(filter),
      headers: this.getAuthHeaders(),
    });
  }

  private buildParams(filter: RecommendationFilter): HttpParams {
    let params = new HttpParams().set('period', filter.period);

    if (filter.period === 'daily') {
      return params.set('date', filter.date);
    }

    if (filter.period === 'monthly') {
      return params.set('month', filter.month);
    }

    params = params.set('startDate', filter.startDate);

    return params.set('endDate', filter.endDate);
  }

  private getAuthHeaders(): { Authorization: string } | undefined {
    const token = this.authService.getToken();

    return token ? { Authorization: `Bearer ${token}` } : undefined;
  }
}
