import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { User } from '../../../../core/models/user.model';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './user-management.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementPage {
  private readonly _adminApi = inject(AdminApiService);
  private readonly _fb = inject(FormBuilder);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');

  readonly filtersForm = this._fb.group({
    role: this._fb.control<string>(''),
    status: this._fb.control<string>(''),
    verified: this._fb.control<string>(''),
  });

  readonly filteredUsers = computed(() => {
    const q = this.search().toLowerCase();
    const role = this.filtersForm.controls.role.value;
    const status = this.filtersForm.controls.status.value;
    const verified = this.filtersForm.controls.verified.value;

    return this.users().filter((user) => {
      if (q) {
        const text = `${user.email} ${user.firstName} ${user.lastName}`.toLowerCase();
        if (!text.includes(q)) {
          return false;
        }
      }
      if (role && user.role !== role) {
        return false;
      }
      if (status === 'BANNED' && !user.isBanned) {
        return false;
      }
      if (status === 'ACTIVE' && user.isBanned) {
        return false;
      }
      if (verified === 'VERIFIED' && !user.isVerified) {
        return false;
      }
      if (verified === 'UNVERIFIED' && user.isVerified) {
        return false;
      }
      return true;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this._adminApi.getUsers().subscribe({
      next: (users) => this.users.set(users ?? []),
      complete: () => this.loading.set(false),
    });
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  banUser(userId: string): void {
    this._adminApi.banUser(userId).subscribe(() => this.load());
  }

  unbanUser(userId: string): void {
    this._adminApi.unbanUser(userId).subscribe(() => this.load());
  }

  viewUser(user: User): void {
    // keep lightweight for now
    // intentionally no navigation to details page yet
    window.alert(`User ${user.email}\nRole: ${user.role}\nVerified: ${user.isVerified}`);
  }
}
