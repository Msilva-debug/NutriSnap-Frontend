import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FoodAnalysisResult } from '../../../../models/meal.model';
import { environment } from '../../../../../environments/environment';

export interface ActivityLevel {
  id: number;
  value: string;
  label: string;
  description: string;
}
@Injectable({
  providedIn: 'root',
})
export class NutritionAnalysisService {
  private readonly API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${environment.geminiApiKey}`;
  private readonly BACKEND_URL = environment.urlBackend.replace(/\/$/, '');

  constructor(private http: HttpClient) {}

  async analyzeImage(imageData: string): Promise<FoodAnalysisResult> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageData,
                },
              },
              {
                text: `Analiza esta imagen de comida y proporciona la información nutricional en JSON con el siguiente formato exacto:
                {
                "name": "nombre del plato",
                "calories": número de calorías,
                "proteins_g": gramos de proteína,
                "carbs_g": gramos de carbohidratos,
                "fats_g": gramos de grasas,
                "micronutrients": "lista de micronutrientes principales"
                }

                Sé específico y realista en tus cálculos. Solo devuelve el JSON, sin explicaciones adicionales.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json', // fuerza respuesta JSON limpia
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message ?? 'Error al llamar a Gemini API');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Respuesta inesperada de Gemini');
    }

    return JSON.parse(text);
  }

  getActivityLevels(): Observable<ActivityLevel[]> {
    return this.http.get<ActivityLevel[]>(`${this.BACKEND_URL}/activity-levels`);
  }
}
