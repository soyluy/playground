import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule, MatButtonModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'hub';

  protected login() {
    window.location.href = 'http://localhost:3000/api/auth/google';
  }

  protected logout() {
    window.location.href = 'http://localhost:3000/api/auth/logout';
  }
}
