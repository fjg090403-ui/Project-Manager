import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  template: `
    <p class="eyebrow">Directory</p>
    <h1 class="mt-2">Users</h1>
    <div class="table">
      @for (user of users; track user['id']) {
        <div class="row">
          <strong>{{ user['name'] }}</strong>
          <span>{{ user['email'] }}</span>
          <span>{{ user['role'] }}</span>
        </div>
      } @empty {
        <div class="empty-state">No users found.</div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  users: Record<string, unknown>[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.users().subscribe((users) => this.users = users as Record<string, unknown>[]);
  }
}
