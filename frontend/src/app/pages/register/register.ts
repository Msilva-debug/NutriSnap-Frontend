import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ActivityLevel, NutritionAnalysisService } from '../add-meal/services/nutrition-analysis.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styles: ``,
})
export class Register implements OnInit {
  form: FormGroup;
  activityLevels: ActivityLevel[] = [];
  loading = signal(false);
  errorMsg = signal('');
  step = signal<1 | 2>(1);
  nutritionService = inject(NutritionAnalysisService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
      birthdate: ['', Validators.required],
      age: [null, [Validators.required, Validators.min(1), Validators.max(120)]],
      weight: [null, [Validators.required, Validators.min(20), Validators.max(300)]],
      height: [null, [Validators.required, Validators.min(50), Validators.max(250)]],
      sex: ['', Validators.required],
      activityLevel: ['', Validators.required],
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
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/login']);
    }, 1500);
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
}
