import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../app-state.service';

@Component({
  templateUrl: './finite.component.html'
})
export class FiniteComponent implements OnInit {
  constructor(private appStateService: AppStateService,
              private router: Router) {}
  
  ngOnInit() {
    if(typeof(this.appStateService.globalState) == "undefined" 
      || this.appStateService.globalState.automata.type != "finite-automata") {
        this.router.navigateByUrl("/");
    } else if(this.appStateService.globalState.metadata.title == "New Project") {
      this.appStateService.globalState.automata.properties.isDeterministic = true;
      this.router.navigateByUrl("/finite/options");
    }
  }
}
