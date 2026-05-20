import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styles: ``,
})
export class Navbar {
  constructor(private router: Router) {}

  logout() {
    this.router.navigate(['/login']);
  }
}
