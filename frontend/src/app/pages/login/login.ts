import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  form: FormGroup;
  loading = signal(false);
  errorMsg = signal('');
  private readonly authService = inject(AuthService);

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    this.errorMsg.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService
      .login(this.buildLoginRequest())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(this.getLoginErrorMessage(error));
        },
      });
  }

  private buildLoginRequest(): LoginRequest {
    const formValue = this.form.getRawValue();

    return {
      email: formValue.email,
      password: formValue.password,
    };
  }

  private getLoginErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudo iniciar sesión. Intenta nuevamente.';
  }

  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }
}
