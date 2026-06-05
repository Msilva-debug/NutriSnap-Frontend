import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  ActivityLevel,
  NutritionAnalysisService,
} from '../add-meal/services/nutrition-analysis.service';
import { RabbitIcon } from '../../components/rabbit-icon/rabbit-icon';
import { CreateUserRequest, UserService } from '../../services/user.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, RabbitIcon],
  templateUrl: './register.html',
  styles: `
    .register-card-scroll {
      scrollbar-color: var(--color-primary-400) var(--color-primary-50);
      scrollbar-width: thin;
    }

    .register-card-scroll::-webkit-scrollbar {
      width: 10px;
    }

    .register-card-scroll::-webkit-scrollbar-track {
      background: var(--color-primary-50);
      border-radius: 999px;
    }

    .register-card-scroll::-webkit-scrollbar-thumb {
      background: var(--color-primary-400);
      border: 2px solid var(--color-primary-50);
      border-radius: 999px;
    }

    .register-card-scroll::-webkit-scrollbar-thumb:hover {
      background: var(--color-primary-500);
    }
  `,
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
  nutritionService = inject(NutritionAnalysisService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['mateocelis1550@gmail.com', [Validators.required, Validators.email]],
      password: ['Mateosilva01', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['Mateosilva01', Validators.required],
      name: ['Mateo', Validators.required],
      birthdate: ['01/06/2004', Validators.required],
      age: ['24', [Validators.required, Validators.min(1), Validators.max(120)]],
      weight: [70, [Validators.required, Validators.min(20), Validators.max(300)]],
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
    const { email, password, confirmPassword } = this.form.value;
    if (!email || !password || password.length < 6) return;
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

  private canSubmit(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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
    };
  }

  private getRegisterErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudo crear la cuenta. Intenta nuevamente.';
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
