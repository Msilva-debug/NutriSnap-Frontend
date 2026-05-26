import { Component, output } from '@angular/core';
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

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  close(): void {
    this.closeRequested.emit();
  }

  logout(): void {
    this.authService.logout();
    this.closeRequested.emit();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
