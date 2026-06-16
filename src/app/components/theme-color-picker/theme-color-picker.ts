import { Component, computed, input, output } from '@angular/core';
import { normalizeHexColor } from '../../services/theme.service';

@Component({
  selector: 'app-theme-color-picker',
  template: `
    <div class="space-y-3 rounded-xl border border-gray-200 p-3">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase text-gray-400">{{ label() }}</p>
          <p class="truncate text-sm font-bold text-gray-800">
            {{ normalizedColor().toUpperCase() }}
          </p>
        </div>

        <label class="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-full ring-1 ring-black/10">
          <span
            class="block h-full w-full"
            [style.background]="normalizedColor()"
            aria-hidden="true"
          ></span>
          <input
            type="color"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            [value]="normalizedColor()"
            [attr.aria-label]="'Elegir color ' + label()"
            (input)="handleColorInput($event)"
          />
        </label>
      </div>
    </div>
  `,
})
export class ThemeColorPicker {
  label = input.required<string>();
  color = input.required<string>();
  colorChange = output<string>();

  readonly normalizedColor = computed(() => normalizeHexColor(this.color()) ?? '#3a3a35');

  handleColorInput(event: Event): void {
    this.emitColor((event.target as HTMLInputElement).value);
  }

  private emitColor(color: string): void {
    const normalizedColor = normalizeHexColor(color);
    if (!normalizedColor) return;

    this.colorChange.emit(normalizedColor);
  }
}
