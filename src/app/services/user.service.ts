import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
}
