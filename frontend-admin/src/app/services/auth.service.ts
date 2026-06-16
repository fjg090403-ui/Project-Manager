import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

interface AuthResponse {
  accessToken: string;
  user: { id: number; name: string; email: string; role: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap((response) => {
        localStorage.setItem('adminToken', response.accessToken);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
      })
    );
  }

  token(): string | null {
    return localStorage.getItem('adminToken');
  }

  isAuthenticated(): boolean {
    return Boolean(this.token());
  }

  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
}
