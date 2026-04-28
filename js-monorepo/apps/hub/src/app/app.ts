import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';
import { ScrollVisibilityDirective } from './directives/scroll-visibility.directive';

@Component({
  imports: [RouterModule, ScrollVisibilityDirective],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'hub';
  protected sidebarExpanded = signal<boolean>(false);

  protected toggleSidebar() {
    this.sidebarExpanded.set(!this.sidebarExpanded());
  }

  protected login() {
    window.location.href = environment.apiUrl + '/auth/google';
  }

  protected logout() {
    window.location.href = environment.apiUrl + '/auth/logout';
  }
}
