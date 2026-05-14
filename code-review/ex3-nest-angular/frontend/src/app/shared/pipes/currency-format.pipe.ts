import { Pipe, PipeTransform } from '@angular/core';

import { formatCurrency } from '../../core/utils/format.utils';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD'): string {
    return formatCurrency(value ?? 0, currency);
  }
}
