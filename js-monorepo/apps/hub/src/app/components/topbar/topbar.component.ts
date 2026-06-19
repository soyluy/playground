import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Theme, ThemeService } from '@hub/ui-infra';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hub-topbar',
  standalone: true,
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly themes: Theme[] = [
    'warm',
    'slate',
    'neutral',
    'navy',
    'terminal',
    'light',
  ];
  protected readonly currentTheme = this.themeService.theme;

  protected setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  protected login(): void {
    window.location.href = environment.apiUrl + '/auth/google';
  }

  protected logout(): void {
    window.location.href = environment.apiUrl + '/auth/logout';
  }
}
