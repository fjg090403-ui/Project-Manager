import { Injectable } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

const storageKey = 'saas-pm-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  preference: ThemePreference = this.read();

  constructor() {
    this.apply(this.preference);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (this.preference === 'system') this.apply('system');
    });
  }

  set(preference: ThemePreference): void {
    this.preference = preference;
    localStorage.setItem(storageKey, preference);
    this.apply(preference);
  }

  private read(): ThemePreference {
    const stored = localStorage.getItem(storageKey);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }

  private apply(preference: ThemePreference): void {
    const resolved = preference === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : preference;
    document.documentElement.dataset['theme'] = resolved;
    document.documentElement.dataset['themePreference'] = preference;
  }
}
