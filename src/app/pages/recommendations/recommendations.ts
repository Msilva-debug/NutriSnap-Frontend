import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import {
  RecommendationFilter,
  RecommendationItem,
  RecommendationPeriod,
  RecommendationsService,
} from '../../services/recommendations.service';

@Component({
  selector: 'app-recommendations',
  imports: [],
  templateUrl: './recommendations.html',
  styles: ``,
})
export class Recommendations implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recommendationsService = inject(RecommendationsService);
  private activeRecommendationsRequest?: Subscription;

  readonly filterModes: { value: RecommendationPeriod; label: string }[] = [
    { value: 'daily', label: 'Diario' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'range', label: 'Rango' },
  ];
  readonly fallbackRecommendations: RecommendationItem[] = [
    {
      category: 'Balance diario',
      title: 'Revisa tus macros',
      description:
        'Usa el panel para comparar proteínas, carbohidratos y grasas contra tu objetivo del día.',
    },
    {
      category: 'Consistencia',
      title: 'Registra cada comida',
      description: 'Agregar tus comidas al momento ayuda a que el resumen diario sea más preciso.',
    },
    {
      category: 'Energía',
      title: 'Distribuye tus calorías',
      description: 'Intenta repartir tu consumo durante el día para evitar llegar con demasiada hambre.',
    },
  ];
  readonly filterMode = signal<RecommendationPeriod>('daily');
  readonly selectedDate = signal(this.getTodayInputDate());
  readonly selectedMonth = signal(this.getCurrentMonthInputValue());
  readonly rangeStartDate = signal(this.getTodayInputDate());
  readonly rangeEndDate = signal(this.getTodayInputDate());
  readonly recommendations = signal<RecommendationItem[]>([]);
  readonly recommendationsSummary = signal<string | null>(null);
  readonly recommendationsError = signal<string | null>(null);
  readonly isLoadingRecommendations = signal(false);
  readonly visibleRecommendations = computed(() =>
    this.recommendations().length ? this.recommendations() : this.fallbackRecommendations,
  );
  readonly rangeError = computed(() => {
    if (this.filterMode() !== 'range') return null;

    return this.rangeStartDate() > this.rangeEndDate()
      ? 'La fecha inicial no puede ser posterior a la fecha final.'
      : null;
  });
  readonly filterLabel = computed(() => {
    const mode = this.filterMode();

    if (mode === 'monthly') {
      return this.formatInputMonth(this.selectedMonth());
    }

    if (mode === 'range') {
      return `del ${this.formatInputDate(this.rangeStartDate())} al ${this.formatInputDate(
        this.rangeEndDate(),
      )}`;
    }

    const date = this.selectedDate();

    return this.formatInputDate(date);
  });
  readonly filterPayload = computed<RecommendationFilter>(() => {
    const mode = this.filterMode();

    if (mode === 'monthly') {
      return {
        period: mode,
        month: this.selectedMonth(),
      };
    }

    if (mode === 'range') {
      return {
        period: mode,
        startDate: this.rangeStartDate(),
        endDate: this.rangeEndDate(),
      };
    }

    return {
      period: mode,
      date: this.selectedDate(),
    };
  });

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const date = params.get('date');

        if (date && this.isValidInputDate(date)) {
          this.filterMode.set('daily');
          this.selectedDate.set(date);
        }

        this.loadRecommendations();
      });
  }

  setFilterMode(mode: RecommendationPeriod): void {
    this.filterMode.set(mode);

    if (mode !== 'range') {
      this.loadRecommendations();
    }
  }

  updateSelectedDate(event: Event): void {
    const date = this.getInputValue(event);

    if (!this.isValidInputDate(date)) return;

    this.selectedDate.set(date);
    this.loadRecommendations();
  }

  updateSelectedMonth(event: Event): void {
    const month = this.getInputValue(event);

    if (!this.isValidInputMonth(month)) return;

    this.selectedMonth.set(month);
    this.loadRecommendations();
  }

  updateRangeStartDate(event: Event): void {
    const date = this.getInputValue(event);

    if (!this.isValidInputDate(date)) return;

    this.rangeStartDate.set(date);
    this.loadRecommendations();
  }

  updateRangeEndDate(event: Event): void {
    const date = this.getInputValue(event);

    if (!this.isValidInputDate(date)) return;

    this.rangeEndDate.set(date);
    this.loadRecommendations();
  }

  private loadRecommendations(): void {
    this.activeRecommendationsRequest?.unsubscribe();

    if (this.rangeError()) {
      this.isLoadingRecommendations.set(false);
      this.recommendationsError.set(null);
      this.recommendations.set([]);
      this.recommendationsSummary.set(null);
      return;
    }

    this.isLoadingRecommendations.set(true);
    this.recommendationsError.set(null);

    this.activeRecommendationsRequest = this.recommendationsService
      .findByFilter(this.filterPayload())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoadingRecommendations.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.recommendations.set(response.recommendations ?? []);
          this.recommendationsSummary.set(response.summary ?? null);
        },
        error: (error: HttpErrorResponse) => {
          this.recommendations.set([]);
          this.recommendationsSummary.set(null);
          this.recommendationsError.set(this.getRecommendationsErrorMessage(error));
        },
      });
  }

  private getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private formatInputDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
    });
  }

  private formatInputMonth(value: string): string {
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    if (Number.isNaN(date.getTime())) return 'Mes no disponible';

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  }

  private isValidInputDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  private isValidInputMonth(value: string): boolean {
    if (!/^\d{4}-\d{2}$/.test(value)) return false;

    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month - 1, 1);

    return date.getFullYear() === year && date.getMonth() === month - 1;
  }

  private getRecommendationsErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudieron cargar las recomendaciones para el periodo seleccionado.';
  }

  private getTodayInputDate(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');

    return `${today.getFullYear()}-${month}-${day}`;
  }

  private getCurrentMonthInputValue(): string {
    const today = new Date();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');

    return `${today.getFullYear()}-${month}`;
  }
}
