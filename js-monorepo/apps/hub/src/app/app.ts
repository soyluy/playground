import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TodoList } from '@hub/todo-ui';

@Component({
  imports: [RouterModule, TodoList],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'hub';
}
