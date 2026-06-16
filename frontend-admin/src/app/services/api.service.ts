import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  users() { return this.http.get<unknown[]>(`${this.apiUrl}/users`); }
  organizations() { return this.http.get<unknown[]>(`${this.apiUrl}/organizations`); }
  projects() { return this.http.get<unknown[]>(`${this.apiUrl}/projects`); }
  notifications() { return this.http.get<unknown[]>(`${this.apiUrl}/notifications`); }
}
