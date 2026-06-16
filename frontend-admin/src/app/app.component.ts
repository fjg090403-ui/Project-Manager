import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ThemePreference, ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="topbar">
      <a routerLink="/" class="brand">SaaS PM Admin</a>
      <div class="flex items-center gap-3">
        <div class="theme-toggle">
          <button [class.active]="theme.preference === 'light'" (click)="setTheme('light')" aria-label="Light theme">L</button>
          <button [class.active]="theme.preference === 'dark'" (click)="setTheme('dark')" aria-label="Dark theme">D</button>
          <button [class.active]="theme.preference === 'system'" (click)="setTheme('system')" aria-label="System theme">S</button>
        </div>
        @if (auth.isAuthenticated()) {
          <div class="nav-actions">
            <a routerLink="/">Dashboard</a>
            <a routerLink="/users">Users</a>
            <a routerLink="/organizations">Organizations</a>
            <a routerLink="/projects">Projects</a>
            <button (click)="logout()">Logout</button>
          </div>
        }
      </div>
    </nav>
    <main class="shell">
      <router-outlet />
    </main>
  `
})
export class AppComponent {
  constructor(public auth: AuthService, public theme: ThemeService, private router: Router) {}

  setTheme(preference: ThemePreference): void {
    this.theme.set(preference);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
