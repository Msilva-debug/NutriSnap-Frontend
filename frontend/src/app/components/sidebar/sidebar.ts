import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { RabbitIcon } from '../rabbit-icon/rabbit-icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, RabbitIcon],
  templateUrl: './sidebar.html',
  styles: ``,
})
export class Sidebar {
  closeRequested = output<void>();

  constructor(private router: Router) {}

  close(): void {
    this.closeRequested.emit();
  }

  logout(): void {
    this.closeRequested.emit();
    this.router.navigate(['/login']);
  }
}
