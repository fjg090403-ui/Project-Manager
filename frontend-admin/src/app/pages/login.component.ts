import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="auth-panel">
      <p class="eyebrow">Admin workspace</p>
      <h1 class="mt-2">Admin login</h1>
      <p class="mt-2 mb-6 text-sm text-muted">Manage teams, organizations and project health.</p>
      <form (ngSubmit)="submit()" class="form">
        <input name="email" [(ngModel)]="email" placeholder="Email">
        <input name="password" [(ngModel)]="password" type="password" placeholder="Password">
        @if (error) { <p class="error">{{ error }}</p> }
        <button>Login</button>
      </form>
      <a class="mt-5 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700" routerLink="/">Back to dashboard</a>
    </section>
  `
})
export class LoginComponent {
  email = 'admin@example.com';
  password = 'password123';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: () => this.error = 'Invalid admin credentials'
    });
  }
}
