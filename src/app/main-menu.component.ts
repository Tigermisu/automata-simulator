import { Component } from '@angular/core';

@Component({
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  setActiveMachine(machine: string) {
    console.log(machine);
  }
}
