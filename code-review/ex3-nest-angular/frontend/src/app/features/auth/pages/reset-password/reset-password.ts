import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { API_BASE_URL, API_ENDPOINTS } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _http = inject(HttpClient);
  private readonly _apiBase = inject(API_BASE_URL);

  readonly loading = signal(false);
  readonly success = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly token = signal<string>('');

  readonly form = this._fb.group(
    {
      password: this._fb.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this._fb.control('', [Validators.required]),
    },
    {
      validators: [(group) => {
        const pass = group.get('password')?.value;
        const confirm = group.get('confirmPassword')?.value;
        return pass === confirm ? null : { passwordMismatch: true };
      }],
    },
  );

  ngOnInit(): void {
    const token = this._route.snapshot.queryParamMap.get('token') ?? '';
    this.token.set(token);
    if (!token) {
      this.error.set('Reset token is missing.');
    }
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    if (this.form.invalid || !this.token()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this._http
      .post(`${this._apiBase}${API_ENDPOINTS.auth.resetPassword}`, {
        token: this.token(),
        password: this.form.controls.password.value,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.success.set('Password has been reset.');
          setTimeout(() => this._router.navigate(['/auth/login']), 900);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Reset failed.');
        },
      });
  }
}
