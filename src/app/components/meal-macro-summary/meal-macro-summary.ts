import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

export interface MealMacroDetail {
  label: string;
  value: number;
  progress: number;
  fillClass: string;
}

@Component({
  selector: 'app-meal-macro-summary',
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      @for (macro of macros(); track macro.label) {
        <div class="rounded-xl border border-gray-200 p-4">
          <p class="text-xs font-medium text-gray-500">{{ macro.label }}</p>
          <p class="mt-1 text-2xl font-bold text-gray-800">{{ macro.value }}g</p>
          <div class="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              class="h-full rounded-full"
              [ngClass]="macro.fillClass"
              [style.width.%]="macro.progress"
            ></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class MealMacroSummary {
  macros = input.required<MealMacroDetail[]>();
}
