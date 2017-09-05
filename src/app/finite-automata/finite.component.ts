import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppStateService } from '../app-state.service';
import { FiniteAutomata } from './finite-automata';
import { Metadata } from '../project';

@Component({
  templateUrl: './finite.component.html'
})
export class FiniteComponent implements OnInit {
  constructor(private appStateService: AppStateService,
              private router: Router) {}

  automata: FiniteAutomata;
  
  ngOnInit() {
    if(this.appStateService.hasActiveProject) {
      this.automata = this.appStateService.project as FiniteAutomata;
      if(this.automata.type != "finite-automata") {
        this.router.navigateByUrl("/home", { replaceUrl: true });
      }
    } else {
      this.automata = new FiniteAutomata(true);
      this.appStateService.project = this.automata;
      this.automata.metadata = new Metadata("New Project");
      this.router.navigateByUrl("/finite/options", { replaceUrl: true });      
    }

    console.log(this.automata, this.appStateService.project, this.automata == this.appStateService.project);
  }
}
