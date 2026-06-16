import { computed, Injectable, signal } from '@angular/core';

export interface AppTheme {
  primaryColor: string;
  secondaryColor: string;
}

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

const defaultTheme: AppTheme = {
  primaryColor: '#6d28d9',
  secondaryColor: '#ecfeff',
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly selectedTheme = signal<AppTheme>(defaultTheme);

  readonly theme = computed(() => this.selectedTheme());
  readonly selectedPrimaryColor = computed(() => this.theme().primaryColor);
  readonly selectedSecondaryColor = computed(() => this.theme().secondaryColor);
  readonly selectedPrimaryContrast = computed(() => getContrastColor(this.theme().primaryColor));

  setPrimaryColor(color: string): void {
    this.updateColor('primaryColor', color);
  }

  setSecondaryColor(color: string): void {
    this.updateColor('secondaryColor', color);
  }

  private updateColor(key: keyof AppTheme, color: string): void {
    const normalizedColor = normalizeHexColor(color);
    if (!normalizedColor) return;

    this.selectedTheme.update((theme) => ({
      ...theme,
      [key]: normalizedColor,
    }));
  }
}

export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const sanitizedValue = value.trim().replace(/^#/, '');

  if (/^[\da-f]{3}$/i.test(sanitizedValue)) {
    const [red, green, blue] = sanitizedValue;
    return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase();
  }

  if (/^[\da-f]{6}$/i.test(sanitizedValue)) {
    return `#${sanitizedValue}`.toLowerCase();
  }

  return null;
}

function getContrastColor(hex: string): string {
  const color = hexToRgb(hex);
  const red = toLinearRgb(color.red);
  const green = toLinearRgb(color.green);
  const blue = toLinearRgb(color.blue);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

  return luminance > 0.45 ? '#111827' : '#ffffff';
}

function hexToRgb(hex: string): RgbColor {
  const normalizedHex = normalizeHexColor(hex) ?? defaultTheme.primaryColor;
  const numericValue = Number.parseInt(normalizedHex.slice(1), 16);

  return {
    red: (numericValue >> 16) & 255,
    green: (numericValue >> 8) & 255,
    blue: numericValue & 255,
  };
}

function toLinearRgb(value: number): number {
  const channel = value / 255;

  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}
