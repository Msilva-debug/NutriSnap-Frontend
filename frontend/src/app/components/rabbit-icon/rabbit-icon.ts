import { Component, input } from '@angular/core';

@Component({
  selector: 'app-rabbit-icon',
  template: `
    <span
      class="inline-flex items-center justify-center leading-none"
      [class]="sizeClass()"
      aria-hidden="true"
    >
      🐰
    </span>
  `,
})
export class RabbitIcon {
  size = input<'sm' | 'md' | 'lg'>('md');

  sizeClass(): string {
    const classes = {
      sm: 'text-2xl',
      md: 'text-3xl',
      lg: 'text-4xl',
    };

    return classes[this.size()];
  }
}
