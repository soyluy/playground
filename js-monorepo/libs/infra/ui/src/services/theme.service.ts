import { Injectable, signal } from '@angular/core';

export type Theme =
  | 'warm'
  | 'slate'
  | 'neutral'
  | 'navy'
  | 'terminal'
  | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'hub-theme';
  private _theme = signal<Theme>(this.loadTheme());

  readonly theme = this._theme.asReadonly();

  constructor() {
    this.applyTheme(this._theme());
  }

  setTheme(theme: Theme) {
    this._theme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private loadTheme(): Theme {
    return (localStorage.getItem(this.STORAGE_KEY) as Theme) ?? 'warm';
  }

  private applyTheme(theme: Theme) {
    document.body.className = `theme-${theme}`;
  }
}
