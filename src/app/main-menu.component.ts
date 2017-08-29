import { Component } from '@angular/core';
import { AppStateService } from './app-state.service';


@Component({
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  constructor(private appStateService: AppStateService) {}
  
  startNewProject(type: string) {
    this.appStateService.startNewProject(type);
  }
}
