import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { NavigationEnd, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { RabbitIcon } from '../rabbit-icon/rabbit-icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, RabbitIcon],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {
  private readonly destroyRef = inject(DestroyRef);

  closeRequested = output<void>();
  mealsMenuOpen = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        if (!event.urlAfterRedirects.startsWith('/meals')) {
          this.mealsMenuOpen.set(false);
        }
      });
  }

  close(): void {
    this.closeRequested.emit();
  }

  toggleMealsMenu(): void {
    this.mealsMenuOpen.update((isOpen) => !isOpen);
  }

  logout(): void {
    this.authService.logout();
    this.closeRequested.emit();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
