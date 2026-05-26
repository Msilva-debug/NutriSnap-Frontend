import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { RabbitIcon } from '../../components/rabbit-icon/rabbit-icon';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, NgClass, RabbitIcon],
  templateUrl: './main-layout.html',
  styles: ``,
})
export class MainLayout {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
