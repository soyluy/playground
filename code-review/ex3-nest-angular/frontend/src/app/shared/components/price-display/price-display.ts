import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { formatCurrency } from '../../../core/utils/format.utils';

@Component({
  selector: 'app-price-display',
  standalone: true,
  template: `
    <span class="price" [class.highlighted]="highlighted" [class.compact]="size === 'sm'" [class.large]="size === 'lg'">
      {{ formattedPrice }}
    </span>
  `,
  styles: [
    `
      .price {
        font-weight: 600;
        color: #111827;
      }

      .price.compact {
        font-size: 13px;
      }

      .price.large {
        font-size: 28px;
      }

      .price.highlighted {
        color: #0f766e;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceDisplayComponent {
  @Input() amount = 0;
  @Input() currency = 'USD';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() highlighted = false;

  get formattedPrice(): string {
    return formatCurrency(this.amount, this.currency);
  }
}
