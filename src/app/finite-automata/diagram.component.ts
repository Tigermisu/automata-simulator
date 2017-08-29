import { Component } from '@angular/core';
import { AppStateService } from '../app-state.service';


@Component({
  templateUrl: './diagram.component.html'
})
export class DiagramComponent {
  constructor(private appStateService: AppStateService) {}
  
}
