import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.urlBackend.replace(/\/$/, '')}/auth`;
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'auth_user';

  constructor(private http: HttpClient) {}

  login(loginDto: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, loginDto).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.access_token);
      }),
    );
  }
}
