import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <section>
      <div class="hero">
        <div>
          <p class="eyebrow">Admin</p>
          <h1>Control center</h1>
          <p>Manage users, organizations and active projects.</p>
        </div>
      </div>
      @if (loading) {
        <div class="skeleton-grid">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      } @else {
        <div class="stats">
          <article><span>{{ users }}</span><p>Users</p></article>
          <article><span>{{ organizations }}</span><p>Organizations</p></article>
          <article><span>{{ projects }}</span><p>Projects</p></article>
          <article><span>{{ notifications }}</span><p>Notifications</p></article>
        </div>
      }
    </section>
  `
})
export class DashboardComponent implements OnInit {
  loading = true;
  users = 0;
  organizations = 0;
  projects = 0;
  notifications = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    let completed = 0;
    const finish = () => {
      completed += 1;
      this.loading = completed < 4;
    };
    this.api.users().subscribe((items) => { this.users = items.length; finish(); });
    this.api.organizations().subscribe((items) => { this.organizations = items.length; finish(); });
    this.api.projects().subscribe((items) => { this.projects = items.length; finish(); });
    this.api.notifications().subscribe((items) => { this.notifications = items.length; finish(); });
  }
}
