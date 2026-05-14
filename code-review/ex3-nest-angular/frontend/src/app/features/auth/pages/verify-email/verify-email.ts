import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { API_BASE_URL, API_ENDPOINTS } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './verify-email.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailPage {
  private readonly _route = inject(ActivatedRoute);
  private readonly _http = inject(HttpClient);
  private readonly _apiBase = inject(API_BASE_URL);

  readonly loading = signal(true);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);
  readonly token = signal('');
  readonly userId = signal('');

  ngOnInit(): void {
    const token = this._route.snapshot.queryParamMap.get('token') ?? '';
    const userId = this._route.snapshot.queryParamMap.get('userId') ?? '';
    this.token.set(token);
    this.userId.set(userId);
    this.verify();
  }

  verify(): void {
    if (!this.token() || !this.userId()) {
      this.loading.set(false);
      this.error.set('Verification token is missing.');
      return;
    }

    this.loading.set(true);
    this._http
      .post<{ success: boolean }>(`${this._apiBase}${API_ENDPOINTS.auth.verifyEmail}`, {
        userId: this.userId(),
        code: this.token(),
      })
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.success.set(!!result.success);
          if (!result.success) {
            this.error.set('Verification failed.');
          }
        },
        error: (err) => {
          this.loading.set(false);
          this.success.set(false);
          this.error.set(err?.error?.message ?? 'Verification failed.');
        },
      });
  }

  resend(): void {
    if (!this.userId()) {
      return;
    }

    this._http
      .post(`${this._apiBase}${API_ENDPOINTS.auth.resendVerification}`, {
        userId: this.userId(),
      })
      .subscribe();
  }
}
