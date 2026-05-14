import { Pipe, PipeTransform } from '@angular/core';

import { formatTimeRemaining } from '../../core/utils/format.utils';

@Pipe({
  name: 'timeRemaining',
  standalone: true,
})
export class TimeRemainingPipe implements PipeTransform {
  transform(value: string | Date): string {
    return formatTimeRemaining(value);
  }
}
