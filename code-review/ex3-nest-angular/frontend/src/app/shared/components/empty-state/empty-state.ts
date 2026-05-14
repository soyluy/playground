import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <section class="empty-state">
      <mat-icon>{{ icon }}</mat-icon>
      <p>{{ message }}</p>
      <a *ngIf="actionLabel && actionRoute" mat-stroked-button [routerLink]="actionRoute">
        {{ actionLabel }}
      </a>
    </section>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 16px;
        border: 1px dashed #d1d5db;
        border-radius: 10px;
        color: #6b7280;
      }

      mat-icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
      }

      p {
        margin: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() message = 'Nothing to show';
  @Input() icon = 'inbox';
  @Input() actionLabel = '';
  @Input() actionRoute = '';
}
