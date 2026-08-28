import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, finalize, map, of, switchMap, timer } from 'rxjs';
import {
  ActivityLevel,
  NutritionAnalysisService,
} from '../meals/add-meal/services/nutrition-analysis.service';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { RabbitIcon } from '../../components/rabbit-icon/rabbit-icon';
import { ThemeCustomizer } from '../../components/theme-customizer/theme-customizer';
import { CreateUserRequest, UserService } from '../../services/user.service';
import { AppTheme, ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, RabbitIcon, ThemeCustomizer, LoadingSpinner],
  templateUrl: './register.html',
  styles: ``,
})
export class Register implements OnInit {
  form: FormGroup;
  activityLevels: ActivityLevel[] = [];
  goals = [
    {
      value: 'lose_fat',
      label: 'Perder grasa',
      description: 'Quiero bajar mi porcentaje de grasa de forma progresiva.',
    },
    {
      value: 'gain_muscle',
      label: 'Ganar masa muscular',
      description: 'Quiero aumentar peso priorizando músculo y rendimiento.',
    },
    {
      value: 'body_recomposition',
      label: 'Recomposición corporal',
      description: 'Quiero perder grasa y ganar músculo al mismo tiempo.',
    },
    {
      value: 'maintain_weight',
      label: 'Mantener mi peso',
      description: 'Quiero sostener mi peso actual y mejorar mis hábitos.',
    },
    {
      value: 'improve_habits',
      label: 'Mejorar mi alimentación',
      description: 'Quiero comer mejor sin enfocarme en cambiar mi peso.',
    },
  ];
  loading = signal(false);
  errorMsg = signal('');
  step = signal<1 | 2>(1);
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);
  readonly themeDraft = signal<AppTheme>(this.themeService.theme());
  nutritionService = inject(NutritionAnalysisService);
  private emailRequestErrorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          asyncValidators: [this.emailAvailabilityValidator()],
        },
      ],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
      birthdate: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      weight: [0, [Validators.required, Validators.min(20), Validators.max(300)]],
      height: ['1.70', [Validators.required, Validators.min(50), Validators.max(250)]],
      sex: ['', Validators.required],
      activityLevel: ['', Validators.required],
      goal: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.nutritionService.getActivityLevels().subscribe({
      next: (activityLevels) => {
        this.activityLevels = activityLevels;
      },
      error: () => {
        this.errorMsg.set('No se pudieron cargar los niveles de actividad.');
      },
    });
  }

  goToStep2() {
    this.email.markAsTouched();
    this.password.markAsTouched();
    this.confirmPassword.markAsTouched();

    const { password, confirmPassword } = this.form.value;
    if (this.email.pending || this.email.invalid || !password || password.length < 6) {
      this.setEmailValidationErrorMessage();
      return;
    }

    if (password !== confirmPassword) {
      this.errorMsg.set('Las contraseñas no coinciden.');
      return;
    }
    this.errorMsg.set('');
    this.step.set(2);
  }

  onSubmit() {
    this.errorMsg.set('');

    if (!this.canSubmit()) return;

    this.loading.set(true);

    this.userService
      .createUser(this.buildCreateUserRequest())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(this.getRegisterErrorMessage(error));
        },
      });
  }

  updateThemeDraft(theme: AppTheme): void {
    this.themeDraft.set(theme);
  }

  private emailAvailabilityValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const email = String(control.value ?? '').trim();

      if (!email || control.hasError('required') || control.hasError('email')) {
        return of(null);
      }

      return timer(450).pipe(
        switchMap(() => this.userService.emailExists(email)),
        map((response) => {
          if (response.exists) {
            this.setEmailRequestErrorMessage(response.message);
            return { emailTaken: { message: response.message } };
          }

          this.clearEmailRequestErrorMessage();

          return null;
        }),
        catchError((error: HttpErrorResponse) => {
          const message = this.getBackendErrorMessage(error);
          this.setEmailRequestErrorMessage(message);

          return of({ emailValidationFailed: { message } });
        }),
      );
    };
  }

  private setEmailValidationErrorMessage(): void {
    const emailTakenError = this.email.getError('emailTaken') as { message?: string | null } | null;
    if (emailTakenError?.message) {
      this.errorMsg.set(emailTakenError.message);
      return;
    }

    const validationFailedError = this.email.getError('emailValidationFailed') as {
      message?: string | null;
    } | null;
    if (validationFailedError?.message) {
      this.errorMsg.set(validationFailedError.message);
    }
  }

  private setEmailRequestErrorMessage(message: string | null): void {
    this.emailRequestErrorMessage = message ?? '';

    if (this.emailRequestErrorMessage) {
      this.errorMsg.set(this.emailRequestErrorMessage);
    }
  }

  private clearEmailRequestErrorMessage(): void {
    if (this.emailRequestErrorMessage && this.errorMsg() === this.emailRequestErrorMessage) {
      this.errorMsg.set('');
    }

    this.emailRequestErrorMessage = '';
  }

  private canSubmit(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.email.invalid) {
        this.setEmailValidationErrorMessage();
        this.step.set(1);
      }

      return false;
    }

    if (this.password.value !== this.confirmPassword.value) {
      this.errorMsg.set('Las contraseñas no coinciden.');
      this.step.set(1);
      return false;
    }

    return true;
  }

  private buildCreateUserRequest(): CreateUserRequest {
    const formValue = this.form.getRawValue();
    const theme = this.themeDraft();

    return {
      email: formValue.email,
      name: formValue.name,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      birthdate: formValue.birthdate,
      age: Number(formValue.age),
      weight: Number(formValue.weight),
      height: Number(formValue.height),
      sex: formValue.sex,
      activityLevel: formValue.activityLevel,
      goal: formValue.goal,
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
    };
  }

  private getRegisterErrorMessage(error: HttpErrorResponse): string {
    const message = this.getBackendErrorMessage(error);

    return message ?? 'No se pudo crear la cuenta. Intenta nuevamente.';
  }

  private getBackendErrorMessage(error: HttpErrorResponse): string | null {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string' ? message : null;
  }

  get email() {
    return this.form.get('email')!;
  }
  get password() {
    return this.form.get('password')!;
  }
  get confirmPassword() {
    return this.form.get('confirmPassword')!;
  }
  get name() {
    return this.form.get('name')!;
  }
  get birthdate() {
    return this.form.get('birthdate')!;
  }
  get age() {
    return this.form.get('age')!;
  }
  get weight() {
    return this.form.get('weight')!;
  }
  get height() {
    return this.form.get('height')!;
  }
  get sex() {
    return this.form.get('sex')!;
  }
  get activityLevel() {
    return this.form.get('activityLevel')!;
  }
  get goal() {
    return this.form.get('goal')!;
  }
}
