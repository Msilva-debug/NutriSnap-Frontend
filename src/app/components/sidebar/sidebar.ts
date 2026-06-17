import { Component, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { RabbitIcon } from '../rabbit-icon/rabbit-icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, RabbitIcon],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {
  closeRequested = output<void>();
  mealsMenuOpen = signal(false);

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

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
