const storageKey = 'saas-pm-theme';

export function getStoredTheme() {
  return localStorage.getItem(storageKey) || 'system';
}

export function resolveTheme(theme) {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = resolveTheme(theme);
  document.documentElement.dataset.themePreference = theme;
}

export function setStoredTheme(theme) {
  localStorage.setItem(storageKey, theme);
  applyTheme(theme);
}

export function initTheme() {
  applyTheme(getStoredTheme());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (getStoredTheme() === 'system') applyTheme('system');
  });
}
