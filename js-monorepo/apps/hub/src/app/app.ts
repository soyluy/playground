import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  imports: [RouterModule, MatButtonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'hub';

  protected login() {
    window.location.href = environment.apiUrl + '/auth/google';
  }

  protected logout() {
    window.location.href = environment.apiUrl + '/auth/logout';
  }
}
