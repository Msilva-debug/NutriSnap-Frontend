import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { FoodPreparation, FoodPreparationForm } from '../../models/food-preparation.model';
import { FoodPreparationService } from '../../services/food-preparation.service';

type DictationStatus = 'idle' | 'listening' | 'paused';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionResultListLike {
  length: number;
  [index: number]: SpeechRecognitionResultLike;
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructorLike {
  new (): SpeechRecognitionLike;
}

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructorLike;
  webkitSpeechRecognition?: SpeechRecognitionConstructorLike;
};

@Component({
  selector: 'app-food-preparations',
  imports: [CommonModule, FormsModule],
  templateUrl: './food-preparations.html',
  styles: ``,
})
export class FoodPreparations implements OnInit {
  private readonly foodPreparationService = inject(FoodPreparationService);
  private readonly destroyRef = inject(DestroyRef);
  private recognition: SpeechRecognitionLike | null = null;

  readonly preparations = signal<FoodPreparation[]>([]);
  readonly selectedPreparation = signal<FoodPreparation | null>(null);
  readonly editingPreparationId = signal<number | null>(null);
  readonly description = signal('');
  readonly servings = signal<number | null>(null);
  readonly dictationStatus = signal<DictationStatus>('idle');
  readonly dictationInterimText = signal('');
  readonly isSpeechSupported = signal(this.getSpeechRecognitionConstructor() !== null);
  readonly isLoadingPreparations = signal(false);
  readonly isAnalyzing = signal(false);
  readonly isSaving = signal(false);
  readonly loadingDetailId = signal<number | null>(null);
  readonly deactivatingPreparationIds = signal<Set<number>>(new Set());
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  analysisForm: FoodPreparationForm | null = null;

  ngOnInit(): void {
    this.loadPreparations();
    this.destroyRef.onDestroy(() => this.destroySpeechRecognition());
  }

  updateDescription(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
  }

  updateServings(event: Event): void {
    this.servings.set(this.getOptionalPositiveNumber(event));
  }

  startDictation(): void {
    const SpeechRecognition = this.getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      this.error.set('El dictado por voz no está disponible en este navegador.');
      return;
    }

    if (!this.recognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-CO';
      this.recognition.onresult = (event) => this.handleSpeechResult(event);
      this.recognition.onerror = (event) => {
        this.error.set(`No se pudo usar el micrófono${event.error ? `: ${event.error}` : '.'}`);
        this.dictationStatus.set('idle');
      };
      this.recognition.onend = () => {
        if (this.dictationStatus() === 'listening') {
          this.dictationStatus.set('paused');
        }
      };
    }

    try {
      this.error.set(null);
      this.dictationInterimText.set('');
      this.dictationStatus.set('listening');
      this.recognition.start();
    } catch {
      this.dictationStatus.set('listening');
    }
  }

  pauseDictation(): void {
    if (this.dictationStatus() !== 'listening') return;

    this.dictationStatus.set('paused');
    this.dictationInterimText.set('');
    this.recognition?.stop();
  }

  stopDictation(): void {
    this.dictationStatus.set('idle');
    this.dictationInterimText.set('');
    this.recognition?.stop();
  }

  analyzePreparation(): void {
    const description = this.description().trim();

    if (!description) {
      this.error.set('Escribe o dicta una preparación antes de analizarla.');
      return;
    }

    this.isAnalyzing.set(true);
    this.error.set(null);
    this.success.set(null);

    this.foodPreparationService
      .analyze({
        description,
        servings: this.servings() ?? undefined,
      })
      .pipe(finalize(() => this.isAnalyzing.set(false)))
      .subscribe({
        next: (response) => {
          this.analysisForm = this.normalizePreparationForm(response);
          this.editingPreparationId.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(this.getBackendErrorMessage(error, 'No se pudo analizar la preparación.'));
        },
      });
  }

  savePreparation(): void {
    if (!this.analysisForm) {
      this.error.set('Analiza una preparación antes de guardarla.');
      return;
    }

    const payload = this.normalizePreparationForm(this.analysisForm);
    const editingId = this.editingPreparationId();
    const request = editingId
      ? this.foodPreparationService.update(editingId, payload)
      : this.foodPreparationService.create(payload);

    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    request.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (preparation) => {
        this.upsertPreparation(preparation);
        this.success.set(editingId ? 'Preparación actualizada.' : 'Preparación guardada.');
        this.resetEditor();
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(this.getBackendErrorMessage(error, 'No se pudo guardar la preparación.'));
      },
    });
  }

  loadPreparationDetail(preparation: FoodPreparation): void {
    this.loadingDetailId.set(preparation.id);
    this.error.set(null);

    this.foodPreparationService
      .findOne(preparation.id)
      .pipe(finalize(() => this.loadingDetailId.set(null)))
      .subscribe({
        next: (detail) => this.selectedPreparation.set(detail),
        error: (error: HttpErrorResponse) => {
          this.error.set(this.getBackendErrorMessage(error, 'No se pudo cargar la preparación.'));
        },
      });
  }

  closeDetail(): void {
    this.selectedPreparation.set(null);
  }

  editPreparation(preparation: FoodPreparation): void {
    this.loadingDetailId.set(preparation.id);
    this.error.set(null);

    this.foodPreparationService
      .findOne(preparation.id)
      .pipe(finalize(() => this.loadingDetailId.set(null)))
      .subscribe({
        next: (detail) => {
          this.analysisForm = this.normalizePreparationForm(detail);
          this.description.set(detail.description);
          this.servings.set(detail.servings);
          this.editingPreparationId.set(detail.id);
          this.selectedPreparation.set(null);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(this.getBackendErrorMessage(error, 'No se pudo cargar la preparación.'));
        },
      });
  }

  deactivatePreparation(preparation: FoodPreparation): void {
    this.setPreparationDeactivating(preparation.id, true);
    this.error.set(null);
    this.success.set(null);

    this.foodPreparationService
      .deactivate(preparation.id)
      .pipe(finalize(() => this.setPreparationDeactivating(preparation.id, false)))
      .subscribe({
        next: () => {
          this.preparations.update((current) =>
            current.filter((item) => item.id !== preparation.id),
          );
          this.success.set('Preparación desactivada.');
          if (this.selectedPreparation()?.id === preparation.id) {
            this.selectedPreparation.set(null);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(
            this.getBackendErrorMessage(error, 'No se pudo desactivar la preparación.'),
          );
        },
      });
  }

  resetEditor(): void {
    this.description.set('');
    this.servings.set(null);
    this.analysisForm = null;
    this.editingPreparationId.set(null);
    this.dictationInterimText.set('');
    this.stopDictation();
  }

  private loadPreparations(): void {
    this.isLoadingPreparations.set(true);
    this.error.set(null);

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

  private handleSpeechResult(event: SpeechRecognitionEventLike): void {
    let finalText = '';
    let interimText = '';

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0]?.transcript ?? '';

      if (result.isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }

    if (finalText.trim()) {
      this.appendDescription(finalText);
    }

    this.dictationInterimText.set(interimText.trim());
  }

  private appendDescription(text: string): void {
    const current = this.description().trim();
    const addition = text.trim();

    if (!addition) return;

    this.description.set(current ? `${current} ${addition}` : addition);
  }

  private destroySpeechRecognition(): void {
    this.dictationStatus.set('idle');
    this.recognition?.abort();
    this.recognition = null;
  }

  private getSpeechRecognitionConstructor(): SpeechRecognitionConstructorLike | null {
    if (typeof window === 'undefined') return null;

    const speechWindow = window as SpeechWindow;

    return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
  }

  private normalizePreparationForm(preparation: FoodPreparationForm): FoodPreparationForm {
    return {
      name: preparation.name ?? '',
      description: preparation.description ?? '',
      servings: this.getPositiveNumber(preparation.servings, 1),
      caloriesPerServing: this.getPositiveNumber(preparation.caloriesPerServing, 0),
      proteinsPerServing: this.getPositiveNumber(preparation.proteinsPerServing, 0),
      carbsPerServing: this.getPositiveNumber(preparation.carbsPerServing, 0),
      fatsPerServing: this.getPositiveNumber(preparation.fatsPerServing, 0),
      micronutrients: preparation.micronutrients ?? '',
      notes: preparation.notes ?? '',
    };
  }

  private upsertPreparation(preparation: FoodPreparation): void {
    this.preparations.update((current) => {
      const exists = current.some((item) => item.id === preparation.id);

      return exists
        ? current.map((item) => (item.id === preparation.id ? preparation : item))
        : [preparation, ...current];
    });
  }

  private setPreparationDeactivating(preparationId: number, isDeactivating: boolean): void {
    this.deactivatingPreparationIds.update((current) => {
      const next = new Set(current);

      if (isDeactivating) {
        next.add(preparationId);
      } else {
        next.delete(preparationId);
      }

      return next;
    });
  }

  private getOptionalPositiveNumber(event: Event): number | null {
    const value = Number((event.target as HTMLInputElement).value);

    return Number.isFinite(value) && value > 0 ? value : null;
  }

  private getPositiveNumber(value: unknown, fallback: number): number {
    const numericValue = Number(value);

    return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : fallback;
  }

  private getBackendErrorMessage(error: HttpErrorResponse, fallback: string): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string' ? message : fallback;
  }
}
