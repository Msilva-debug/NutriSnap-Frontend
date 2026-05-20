import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  form: FormGroup;
  loading = signal(false);
  errorMsg = signal('');

  constructor(private fb: FormBuilder, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMsg.set('');
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}
