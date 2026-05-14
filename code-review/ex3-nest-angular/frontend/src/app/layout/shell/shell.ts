import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SocketService } from '../../core/services/socket.service';
import { HeaderComponent } from '../header/header';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly _socket = inject(SocketService);

  readonly connectionState = this._socket.connectionStatus;
  readonly connectionLabel = computed(() => {
    const state = this.connectionState();
    if (state === 'disconnected') {
      return 'Disconnected';
    }
    return 'Connected';
  });
}
