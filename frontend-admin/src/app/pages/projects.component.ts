import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  template: `
    <p class="eyebrow">Portfolio</p>
    <h1 class="mt-2">Projects</h1>
    <div class="table">
      @for (project of projects; track project['id']) {
        <div class="row">
          <strong>{{ project['name'] }}</strong>
          <span>{{ project['description'] }}</span>
          <span>Board {{ project['boardId'] }}</span>
        </div>
      } @empty {
        <div class="empty-state">No projects found.</div>
      }
    </div>
  `
})
export class ProjectsComponent implements OnInit {
  projects: Record<string, unknown>[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.projects().subscribe((items) => this.projects = items as Record<string, unknown>[]);
  }
}
