import { computed, Injectable, signal } from '@angular/core';

type ThemeShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type ThemeScale = Record<ThemeShade, string>;

export interface AppTheme {
  primaryColor: string;
  secondaryColor: string;
}

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

const themeShades: ThemeShade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

const defaultTheme: AppTheme = {
  primaryColor: '#6d28d9',
  secondaryColor: '#ecfeff',
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly storageKey = 'app_theme';
  private readonly selectedTheme = signal<AppTheme>(this.getStoredTheme());

  readonly theme = computed(() => this.selectedTheme());
  readonly selectedPrimaryColor = computed(() => this.theme().primaryColor);
  readonly selectedSecondaryColor = computed(() => this.theme().secondaryColor);
  readonly selectedPrimaryContrast = computed(() => getContrastColor(this.theme().primaryColor));

  constructor() {
    this.applyTailwindTheme(this.theme());
  }

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

  applyUserTheme(theme: Partial<AppTheme>): void {
    const nextTheme = {
      primaryColor: normalizeHexColor(theme.primaryColor) ?? defaultTheme.primaryColor,
      secondaryColor: normalizeHexColor(theme.secondaryColor) ?? defaultTheme.secondaryColor,
    };

    this.selectedTheme.set(nextTheme);
    this.persistTheme(nextTheme);
    this.applyTailwindTheme(nextTheme);
  }

  resetTheme(): void {
    this.selectedTheme.set(defaultTheme);
    this.removeStoredTheme();
    this.applyTailwindTheme(defaultTheme);
  }

  private applyTailwindTheme(theme: AppTheme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const primaryScale = createThemeScale(theme.primaryColor);
    const secondaryScale = createThemeScale(theme.secondaryColor);

    this.applyColorScale(root, 'primary', primaryScale);
    this.applyColorScale(root, 'secondary', secondaryScale);
    this.applyColorScale(root, 'accent', secondaryScale);
    root.style.setProperty('--color-primary-contrast', getContrastColor(theme.primaryColor));
    root.style.setProperty('--color-accent-contrast', getContrastColor(theme.secondaryColor));
  }

  private applyColorScale(root: HTMLElement, colorName: string, scale: ThemeScale): void {
    for (const shade of themeShades) {
      root.style.setProperty(`--color-${colorName}-${shade}`, scale[shade]);
    }
  }

  private getStoredTheme(): AppTheme {
    if (typeof localStorage === 'undefined') return defaultTheme;

    const storedTheme = localStorage.getItem(this.storageKey);
    if (!storedTheme) return defaultTheme;

    try {
      const parsed = JSON.parse(storedTheme) as Partial<AppTheme>;

      return {
        primaryColor: normalizeHexColor(parsed.primaryColor) ?? defaultTheme.primaryColor,
        secondaryColor: normalizeHexColor(parsed.secondaryColor) ?? defaultTheme.secondaryColor,
      };
    } catch {
      this.removeStoredTheme();
      return defaultTheme;
    }
  }

  private persistTheme(theme: AppTheme): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.setItem(this.storageKey, JSON.stringify(theme));
  }

  private removeStoredTheme(): void {
    if (typeof localStorage === 'undefined') return;

    localStorage.removeItem(this.storageKey);
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

function createThemeScale(color: string): ThemeScale {
  const hex = normalizeHexColor(color) ?? defaultTheme.primaryColor;
  const rgb = hexToRgb(hex);

  return {
    50: mixColors(rgb, white, 0.94),
    100: mixColors(rgb, white, 0.86),
    200: mixColors(rgb, white, 0.72),
    300: mixColors(rgb, white, 0.52),
    400: mixColors(rgb, white, 0.28),
    500: rgbToHex(rgb),
    600: mixColors(rgb, black, 0.16),
    700: mixColors(rgb, black, 0.34),
    800: mixColors(rgb, black, 0.56),
    900: mixColors(rgb, black, 0.76),
  };
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

const white: RgbColor = {
  red: 255,
  green: 255,
  blue: 255,
};

const black: RgbColor = {
  red: 0,
  green: 0,
  blue: 0,
};

function rgbToHex(color: RgbColor): string {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');

  return `#${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
}

function mixColors(source: RgbColor, target: RgbColor, weight: number): string {
  return rgbToHex({
    red: source.red * (1 - weight) + target.red * weight,
    green: source.green * (1 - weight) + target.green * weight,
    blue: source.blue * (1 - weight) + target.blue * weight,
  });
}

function toLinearRgb(value: number): number {
  const channel = value / 255;

  return channel <= 0.03928
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
