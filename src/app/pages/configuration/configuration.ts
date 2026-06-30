import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { ThemeCustomizer } from '../../components/theme-customizer/theme-customizer';
import { AppTheme, normalizeTheme, ThemeService } from '../../services/theme.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-configuration',
  imports: [ThemeCustomizer, LoadingSpinner],
  templateUrl: './configuration.html',
  styles: ``,
})
export class Configuration {
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);

  readonly themeDraft = signal<AppTheme>(this.themeService.theme());
  readonly saving = signal(false);
  readonly successMsg = signal('');
  readonly errorMsg = signal('');

  readonly hasChanges = computed(() => {
    const savedTheme = normalizeTheme(this.themeService.theme());
    const draftTheme = normalizeTheme(this.themeDraft());

    return (
      draftTheme.primaryColor !== savedTheme.primaryColor ||
      draftTheme.secondaryColor !== savedTheme.secondaryColor
    );
  });

  updateThemeDraft(theme: AppTheme): void {
    this.themeDraft.set(theme);
    this.clearMessages();
  }

  restoreCurrentTheme(): void {
    this.themeDraft.set(this.themeService.theme());
    this.clearMessages();
  }

  saveTheme(): void {
    const theme = normalizeTheme(this.themeDraft(), this.themeService.theme());

    this.saving.set(true);
    this.clearMessages();

    this.userService
      .updateTheme(theme)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (savedTheme) => {
          this.themeService.applyUserTheme(savedTheme);
          this.themeDraft.set(savedTheme);
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
