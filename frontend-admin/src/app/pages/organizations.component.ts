import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-organizations',
  standalone: true,
  template: `
    <p class="eyebrow">Workspace</p>
    <h1 class="mt-2">Organizations</h1>
    <div class="table">
      @for (org of organizations; track org['id']) {
        <div class="row">
          <strong>{{ org['name'] }}</strong>
          <span>{{ org['createdAt'] }}</span>
        </div>
      } @empty {
        <div class="empty-state">No organizations found.</div>
      }
    </div>
  `
})
export class OrganizationsComponent implements OnInit {
  organizations: Record<string, unknown>[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.organizations().subscribe((items) => this.organizations = items as Record<string, unknown>[]);
  }
}
