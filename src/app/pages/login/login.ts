import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { RabbitIcon } from '../../components/rabbit-icon/rabbit-icon';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { MealStateService } from '../../services/meal-state.service';
import { NutritionPlanStateService } from '../../services/nutrition-plan-state.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, RabbitIcon, LoadingSpinner],
  templateUrl: './login.html',
  styles: ``,
})
export class Login implements OnInit {
  form: FormGroup;
  loading = signal(false);
  errorMsg = signal('');
  private readonly authService = inject(AuthService);
  private readonly nutritionPlanState = inject(NutritionPlanStateService);
  private readonly mealState = inject(MealStateService);
  showSessionExpiredModal = signal(false);
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      email: ['mateocelis1550@gmail.com', [Validators.required, Validators.email]],
      password: ['Mateosilva01', [Validators.required, Validators.minLength(6)]],
    });
  }
  ngOnInit(): void {
    const sessionExpired = this.route.snapshot.queryParamMap.get('sessionExpired') === 'true';
    this.showSessionExpiredModal.set(sessionExpired);
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
      .pipe(switchMap(() => forkJoin([
        this.nutritionPlanState.loadMine(),
        this.mealState.loadToday(),
      ])))
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

    return typeof message === 'string' ? message : 'No se pudo iniciar sesión. Intenta nuevamente.';
  }
  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }
}
