import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FoodPreparation } from '../../models/food-preparation.model';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';

@Component({
  selector: 'app-food-preparation-card',
  imports: [CommonModule, LoadingSpinner],
  templateUrl: './food-preparation-card.html',
  styles: ``,
})
export class FoodPreparationCard {
  readonly preparation = input.required<FoodPreparation>();
  readonly selected = input(false);
  readonly selectable = input(false);
  readonly showActions = input(false);
  readonly loadingDetail = input(false);
  readonly loadingEdit = input(false);
  readonly deactivating = input(false);

  readonly preparationSelected = output<FoodPreparation>();
  readonly detailRequested = output<FoodPreparation>();
  readonly editRequested = output<FoodPreparation>();
  readonly deactivateRequested = output<FoodPreparation>();

  readonly isLoadingAction = () => this.loadingDetail() || this.loadingEdit();

  cardClasses(): string {
    if (!this.selectable()) {
      return 'rounded-xl border border-gray-100 p-4';
    }

    return this.selected()
      ? 'w-full rounded-xl border-2 border-primary-500 bg-primary-50 p-4 text-left transition'
      : 'w-full rounded-xl border-2 border-gray-100 p-4 text-left transition hover:border-gray-200';
  }
}
