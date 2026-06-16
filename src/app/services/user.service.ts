import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  birthdate: string;
  age: number;
  weight: number;
  height: number;
  sex: string;
  activityLevel: string;
  goal: string;
  primaryColor: string;
  secondaryColor: string;
}

type EmailExistsResponse =
  | boolean
  | {
      exists?: boolean;
      emailExists?: boolean;
      registered?: boolean;
      isRegistered?: boolean;
      available?: boolean;
      message?: string | string[];
    };

export interface EmailExistsResult {
  exists: boolean;
  message: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly usersUrl = `${environment.urlBackend.replace(/\/$/, '')}/users`;

  constructor(private http: HttpClient) {}

  createUser(createUserDto: CreateUserRequest): Observable<unknown> {
    return this.http.post(this.usersUrl, createUserDto);
  }

  emailExists(email: string): Observable<EmailExistsResult> {
    return this.http
      .get<EmailExistsResponse>(`${this.usersUrl}/exists-email`, {
        params: { email },
      })
      .pipe(map((response) => this.parseEmailExistsResponse(response)));
  }

  private parseEmailExistsResponse(response: EmailExistsResponse): EmailExistsResult {
    if (typeof response === 'boolean') {
      return {
        exists: response,
        message: null,
      };
    }

    if (typeof response.available === 'boolean') {
      return {
        exists: !response.available,
        message: this.getResponseMessage(response),
      };
    }

    return {
      exists: Boolean(
        response.exists ??
          response.emailExists ??
          response.registered ??
          response.isRegistered,
      ),
      message: this.getResponseMessage(response),
    };
  }

  private getResponseMessage(response: EmailExistsResponse): string | null {
    if (typeof response === 'boolean') return null;

    if (Array.isArray(response.message)) {
      return response.message.join(' ');
    }

    return response.message ?? null;
  }
}
