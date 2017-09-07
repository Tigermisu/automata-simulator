import { Component } from '@angular/core';
import { AppStateService } from '../app-state.service';

@Component({
  templateUrl: './table.component.html'
})
export class TableComponent {
  constructor(private appStateService: AppStateService) { }
}
