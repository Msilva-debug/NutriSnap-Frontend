import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { NutritionAnalysisService } from './services/nutrition-analysis.service';
import { FoodAnalysisResult } from '../../../models/meal.model';
import { CreateMealRequest, MealService } from '../../../services/meal.service';
import { MealStateService } from '../../../services/meal-state.service';
import { MEAL_TYPE_OPTIONS, MealType } from '../../../utils/meal-types.util';

@Component({
  selector: 'app-add-meal',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-meal.html',
  styles: ``,
})
export class AddMeal {
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isAnalyzing = signal(false);
  isSaving = signal(false);
  analysisResult = signal<FoodAnalysisResult | null>(null);
  showModal = signal(false);
  mealType = signal<MealType>('lunch');
  error = signal<string | null>(null);
  readonly mealTypeOptions = MEAL_TYPE_OPTIONS;

  constructor(
    private nutritionService: NutritionAnalysisService,
    private mealService: MealService,
    private mealState: MealStateService,
  ) {}

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedImage.set(file);
    this.error.set(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  analyzeImage(): void {
    if (!this.selectedImage()) {
      this.error.set('Por favor selecciona una imagen');
      return;
    }

    this.isAnalyzing.set(true);
    this.error.set(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = (e.target?.result as string).split(',')[1];
        const result = await this.nutritionService.analyzeImage(base64);
        this.analysisResult.set(result);
        this.showModal.set(true);
        this.isAnalyzing.set(false);
      } catch (err) {
        this.error.set(`Error al analizar la imagen: ${err}`);
        this.isAnalyzing.set(false);
      }
    };
    reader.readAsDataURL(this.selectedImage()!);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveMeal(): void {
    const result = this.analysisResult();
    if (!result) return;

    const meal: CreateMealRequest = {
      name: result.name,
      calories: result.calories,
      proteins: result.proteins_g,
      carbs: result.carbs_g,
      fats: result.fats_g,
      type: this.mealType(),
    };

    this.isSaving.set(true);
    this.error.set(null);

    this.mealService
      .createMeal(meal)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (savedMeal) => {
          this.mealState.addTodayMeal(savedMeal);
          this.showModal.set(false);
          this.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(this.getSaveMealErrorMessage(error));
          this.showModal.set(false);
        },
      });
  }

  reset(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.analysisResult.set(null);
    this.showModal.set(false);
    this.error.set(null);
  }

  private getSaveMealErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudo guardar la comida. Intenta nuevamente.';
  }
}
