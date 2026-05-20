import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NutritionAnalysisService } from '../../services/nutrition-analysis.service';
import { FoodAnalysisResult, Meal } from '../../models/meal.model';

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
  analysisResult = signal<FoodAnalysisResult | null>(null);
  showModal = signal(false);
  mealType = signal<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  error = signal<string | null>(null);

  constructor(private nutritionService: NutritionAnalysisService) {}

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

    const meal: Meal = {
      id: Date.now().toString(),
      name: result.name,
      calories: result.calories,
      proteins: result.proteins_g,
      carbs: result.carbs_g,
      fats: result.fats_g,
      time: new Date().toLocaleTimeString(),
      type: this.mealType(),
    };

    console.log('Comida guardada:', meal);
    this.showModal.set(false);
    // TODO: Guardar en el servidor/almacenamiento
  }

  reset(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.analysisResult.set(null);
    this.showModal.set(false);
    this.error.set(null);
  }
}
