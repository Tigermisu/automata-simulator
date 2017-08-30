import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppStateService } from '../app-state.service';


@Component({
  templateUrl: './diagram.component.html'
})
export class DiagramComponent implements OnInit, OnDestroy {
  constructor(private appStateService: AppStateService) {}
 
  ngOnInit() {
    this.appStateService.requestToolbar('finite-automata');
  }

  ngOnDestroy() {
    this.appStateService.releaseToolbar();
  }
}
