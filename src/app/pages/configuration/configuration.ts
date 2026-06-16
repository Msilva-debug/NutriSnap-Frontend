import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ThemeColorPicker } from '../../components/theme-color-picker/theme-color-picker';
import { getContrastColor, normalizeHexColor, ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-configuration',
  imports: [ThemeColorPicker],
  templateUrl: './configuration.html',
  styles: ``,
})
export class Configuration {
  private readonly userService = inject(UserService);
  readonly themeService = inject(ThemeService);

  readonly primaryColor = signal(this.themeService.theme().primaryColor);
  readonly secondaryColor = signal(this.themeService.theme().secondaryColor);
  readonly saving = signal(false);
  readonly successMsg = signal('');
  readonly errorMsg = signal('');

  readonly primaryContrast = computed(() => getContrastColor(this.primaryColor()));
  readonly secondaryContrast = computed(() => getContrastColor(this.secondaryColor()));
  readonly hasChanges = computed(() => {
    const theme = this.themeService.theme();

    return (
      normalizeHexColor(this.primaryColor()) !== normalizeHexColor(theme.primaryColor) ||
      normalizeHexColor(this.secondaryColor()) !== normalizeHexColor(theme.secondaryColor)
    );
  });

  selectPrimaryColor(color: string): void {
    this.primaryColor.set(color);
    this.clearMessages();
  }

  selectSecondaryColor(color: string): void {
    this.secondaryColor.set(color);
    this.clearMessages();
  }

  restoreCurrentTheme(): void {
    const theme = this.themeService.theme();

    this.primaryColor.set(theme.primaryColor);
    this.secondaryColor.set(theme.secondaryColor);
    this.clearMessages();
  }

  saveTheme(): void {
    const theme = {
      primaryColor: normalizeHexColor(this.primaryColor()) ?? this.themeService.theme().primaryColor,
      secondaryColor:
        normalizeHexColor(this.secondaryColor()) ?? this.themeService.theme().secondaryColor,
    };

    this.saving.set(true);
    this.clearMessages();

    this.userService
      .updateTheme(theme)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (savedTheme) => {
          this.themeService.applyUserTheme(savedTheme);
          this.primaryColor.set(savedTheme.primaryColor);
          this.secondaryColor.set(savedTheme.secondaryColor);
          this.successMsg.set('Colores guardados correctamente.');
        },
        error: (error: HttpErrorResponse) => {
          this.errorMsg.set(this.getBackendErrorMessage(error));
        },
      });
  }

  private clearMessages(): void {
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  private getBackendErrorMessage(error: HttpErrorResponse): string {
    const message = error.error?.message;

    if (Array.isArray(message)) {
      return message.join(' ');
    }

    return typeof message === 'string'
      ? message
      : 'No se pudieron guardar los colores. Intenta nuevamente.';
  }
}
