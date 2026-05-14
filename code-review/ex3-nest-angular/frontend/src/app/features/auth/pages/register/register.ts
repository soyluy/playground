import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { catchError, map, of, switchMap } from 'rxjs';

import { API_BASE_URL } from '../../../../core/constants/api.constants';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _auth = inject(AuthService);
  private readonly _http = inject(HttpClient);
  private readonly _apiBase = inject(API_BASE_URL);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly roles: Array<UserRole> = ['BUYER', 'SELLER'];

  readonly form = this._fb.group(
    {
      firstName: this._fb.control('', [Validators.required, Validators.minLength(2)]),
      lastName: this._fb.control('', [Validators.required, Validators.minLength(2)]),
      email: this._fb.control('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.emailAvailableValidator()],
      }),
      password: this._fb.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this._fb.control('', [Validators.required]),
      role: this._fb.control<UserRole>('BUYER', { nonNullable: true }),
      acceptTerms: this._fb.control(false, Validators.requiredTrue),
    },
    { validators: [this.passwordMatchValidator] },
  );

  readonly passwordStrength = computed(() => {
    const value = this.form.controls.password.value ?? '';
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'medium';
    return 'strong';
  });

  submit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const raw = this.form.getRawValue();
    this._auth
      .register({
        email: raw.email ?? '',
        password: raw.password ?? '',
        firstName: raw.firstName ?? '',
        lastName: raw.lastName ?? '',
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Account created. Check your email for verification.');
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err?.error?.message ?? 'Registration failed.');
        },
      });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!password || !confirmPassword) {
      return null;
    }
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private emailAvailableValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const email = String(control.value ?? '').trim();
      if (!email) {
        return of(null);
      }

      return of(email).pipe(
        switchMap((value) =>
          this._http.get<{ available: boolean }>(
            `${this._apiBase}/auth/email-available`,
            { params: { email: value } },
          ),
        ),
        map((result) => (result.available ? null : { emailTaken: true })),
        catchError(() => of(null)),
      );
    };
  }
}
