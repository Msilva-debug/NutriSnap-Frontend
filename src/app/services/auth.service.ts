import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppStore } from '../store/app.store';
import { ThemeService } from './theme.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  primaryColor?: string;
  secondaryColor?: string;
  user?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.urlBackend.replace(/\/$/, '')}/auth`;
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';
  private readonly logoutSubject = new Subject<void>();
  readonly logout$ = this.logoutSubject.asObservable();

  constructor(
    private http: HttpClient,
    private appStore: AppStore,
    private themeService: ThemeService,
  ) {}

  login(loginDto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, loginDto).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.access_token);
        this.applyThemeFromLoginResponse(response);
      }),
    );
  }
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  hasValidToken(): boolean {
    return this.hasToken() && !this.isTokenExpired();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.themeService.resetTheme();
    this.appStore.dispatch({ type: 'auth/logout' });
    this.logoutSubject.next();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;

      const payload = JSON.parse(atob(payloadBase64));
      const expiresAt = Number(payload.exp) * 1000;

      return !Number.isFinite(expiresAt) || Date.now() >= expiresAt;
    } catch {
      return true;
    }
  }

  private applyThemeFromLoginResponse(response: LoginResponse): void {
    this.themeService.applyUserTheme({
      primaryColor: response.primaryColor ?? response.user?.primaryColor,
      secondaryColor: response.secondaryColor ?? response.user?.secondaryColor,
    });
  }
}
