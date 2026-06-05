import { Component, signal, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Meal } from '../../models/meal.model';

@Component({
  selector: 'app-meal-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './meal-form.html',
  styles: ``,
})
export class MealForm {
  form: FormGroup;
  loading = signal(false);
  mealAdded = output<Meal>();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      calories: [null, [Validators.required, Validators.min(1), Validators.max(10000)]],
      time: ['', Validators.required],
      type: ['breakfast', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);

    const newMeal: Meal = {
      ...this.form.value,
    };

    setTimeout(() => {
      this.mealAdded.emit(newMeal);
      this.form.reset({ type: 'breakfast' });
      this.loading.set(false);
    }, 500);
  }

  get name() { return this.form.get('name')!; }
  get calories() { return this.form.get('calories')!; }
  get time() { return this.form.get('time')!; }
  get type() { return this.form.get('type')!; }
}
