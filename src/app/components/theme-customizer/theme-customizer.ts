import { Component, computed, input, output } from '@angular/core';
import { ThemeColorPicker } from '../theme-color-picker/theme-color-picker';
import {
  AppTheme,
  getContrastColor,
  normalizeHexColor,
  normalizeTheme,
} from '../../services/theme.service';

@Component({
  selector: 'app-theme-customizer',
  imports: [ThemeColorPicker],
  templateUrl: './theme-customizer.html',
  styles: ``,
})
export class ThemeCustomizer {
  theme = input.required<AppTheme>();
  variant = input<'full' | 'compact'>('full');
  themeChange = output<AppTheme>();

  readonly normalizedTheme = computed(() => normalizeTheme(this.theme()));
  readonly primaryContrast = computed(() => getContrastColor(this.normalizedTheme().primaryColor));
  readonly secondaryContrast = computed(() => getContrastColor(this.normalizedTheme().secondaryColor));

  updateColor(key: keyof AppTheme, color: string): void {
    const normalizedColor = normalizeHexColor(color);
    if (!normalizedColor) return;

    this.themeChange.emit({
      ...this.normalizedTheme(),
      [key]: normalizedColor,
    });
  }
}
