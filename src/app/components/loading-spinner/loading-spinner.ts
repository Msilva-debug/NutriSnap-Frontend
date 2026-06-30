import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.html',
  styles: ``,
})
export class LoadingSpinner {
  readonly size = input('h-4 w-4');
  readonly tone = input('text-current');

  spinnerClass(): string {
    return `${this.size()} animate-spin ${this.tone()}`;
  }
}
