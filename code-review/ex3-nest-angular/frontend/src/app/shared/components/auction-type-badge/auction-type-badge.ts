import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AuctionType } from '../../../core/models/auction.model';

@Component({
  selector: 'app-auction-type-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="type-badge">
      {{ type }}
    </span>
  `,
  styles: [
    `
      .type-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.2px;
        background: #dbeafe;
        color: #1d4ed8;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionTypeBadgeComponent {
  @Input({ required: true }) type!: AuctionType;
}
