import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-nutrient-overage-alert',
  template: `
    <button
      type="button"
      (click)="open()"
      class="cursor-pointer flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-primary-900 shadow-sm transition hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200"
      [attr.aria-label]="'Ver exceso de ' + nutrient()"
    >
      !
    </button>

    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4"
        (click)="close()"
      >
        <div
          class="w-full max-w-sm rounded-2xl bg-white p-5 text-gray-900 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nutrient-overage-title"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-start justify-between gap-4">
            <div class="flex items-center gap-3">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-lg font-black text-primary-900"
                aria-hidden="true"
              >
                !
              </span>
              <div>
                <h2 id="nutrient-overage-title" class="text-lg font-bold text-gray-900">
                  Meta excedida
                </h2>
                <p class="text-sm text-gray-500">{{ nutrient() }}</p>
              </div>
            </div>

            <button
              type="button"
              (click)="close()"
              class="rounded-lg px-3 py-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
              aria-label="Cerrar alerta"
            >
              ✕
            </button>
          </div>

          <p class="text-sm font-medium text-gray-700">
            Te pasaste por
            <span class="font-bold text-yellow-700">{{ amount() }}{{ unit() }}</span>
            en {{ nutrient() }}.
          </p>
        </div>
      </div>
    }
  `,
})
export class NutrientOverageAlert {
  nutrient = input.required<string>();
  amount = input.required<number>();
  unit = input.required<string>();
  isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}
