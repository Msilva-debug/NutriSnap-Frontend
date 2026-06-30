import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { NutritionAnalysisService } from './services/nutrition-analysis.service';
import { FoodPreparation } from '../../../models/food-preparation.model';
import { FoodAnalysisResult } from '../../../models/meal.model';
import { CreateMealRequest, MealService } from '../../../services/meal.service';
import { FoodPreparationService } from '../../../services/food-preparation.service';
import { MealStateService } from '../../../services/meal-state.service';
import { MEAL_TYPE_OPTIONS, MealType } from '../../../utils/meal-types.util';

@Component({
  selector: 'app-add-meal',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-meal.html',
  styles: ``,
})
export class AddMeal implements OnInit {
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  preparations = signal<FoodPreparation[]>([]);
  selectedPreparation = signal<FoodPreparation | null>(null);
  consumedServings = signal<number | null>(1);
  isAnalyzing = signal(false);
  isSaving = signal(false);
  isLoadingPreparations = signal(false);
  isRegisteringPreparationMeal = signal(false);
  analysisResult = signal<FoodAnalysisResult | null>(null);
  showModal = signal(false);
  mealType = signal<MealType>('lunch');
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  readonly mealTypeOptions = MEAL_TYPE_OPTIONS;

  constructor(
    private nutritionService: NutritionAnalysisService,
    private mealService: MealService,
    private foodPreparationService: FoodPreparationService,
    private mealState: MealStateService,
  ) {}

  ngOnInit(): void {
    this.loadFoodPreparations();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedImage.set(file);
    this.selectedPreparation.set(null);
    this.error.set(null);
    this.success.set(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  analyzeImage(): void {
    const image = this.selectedImage();

    if (!image) {
      this.error.set('Por favor selecciona una imagen');
      return;
    }

    this.isAnalyzing.set(true);
    this.error.set(null);
    this.success.set(null);

    this.nutritionService
      .analyzeImage(image)
      .pipe(finalize(() => this.isAnalyzing.set(false)))
      .subscribe({
        next: (result) => {
          this.analysisResult.set(result);
          this.showModal.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(this.getAnalyzeImageErrorMessage(error));
        },
      });
  }

  private getAnalyzeImageErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudo analizar la imagen. Intenta nuevamente.';
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  selectPreparation(preparation: FoodPreparation): void {
    this.selectedPreparation.set(preparation);
    this.consumedServings.set(1);
    this.error.set(null);
    this.success.set(null);
  }

  updateConsumedServings(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    this.consumedServings.set(Number.isFinite(value) && value > 0 ? value : null);
  }

  registerPreparationAsMeal(): void {
    const preparation = this.selectedPreparation();

    if (!preparation) {
      this.error.set('Selecciona una preparación guardada.');
      return;
    }

    this.isRegisteringPreparationMeal.set(true);
    this.error.set(null);
    this.success.set(null);

    this.foodPreparationService
      .registerAsMeal(preparation.id, {
        type: this.mealType(),
        servings: this.consumedServings() ?? undefined,
      })
      .pipe(finalize(() => this.isRegisteringPreparationMeal.set(false)))
      .subscribe({
        next: (meal) => {
          this.mealState.addTodayMeal(meal);
          this.success.set('Preparación registrada como comida.');
          this.selectedPreparation.set(null);
          this.consumedServings.set(1);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(
            this.getBackendErrorMessage(error, 'No se pudo registrar la preparación como comida.'),
          );
        },
      });
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
    this.success.set(null);

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

  private loadFoodPreparations(): void {
    this.isLoadingPreparations.set(true);

    this.foodPreparationService
      .findAll()
      .pipe(finalize(() => this.isLoadingPreparations.set(false)))
      .subscribe({
        next: (preparations) => this.preparations.set(preparations ?? []),
        error: (error: HttpErrorResponse) => {
          this.error.set(
            this.getBackendErrorMessage(error, 'No se pudieron cargar tus preparaciones.'),
          );
        },
      });
  }

  private getSaveMealErrorMessage(error: HttpErrorResponse): string {
    return this.getBackendErrorMessage(
      error,
      'No se pudo guardar la comida. Intenta nuevamente.',
    );
  }

  private getBackendErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string' ? message : fallback;
  }
}
