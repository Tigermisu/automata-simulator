import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ProjectComponent } from '../project.component';
import { AppStateService } from '../app-state.service';
import { FiniteAutomaton } from './finite-automaton';
import { Subscription } from 'rxjs/Subscription';
import { ToolEvent } from '../toolbar.component';
import { AlphabetSymbol } from '../automaton';
import { Router } from '@angular/router';
import { Metadata } from '../project';

declare var alertify;

@Component({
  templateUrl: './finite.component.html'
})
export class FiniteComponent extends ProjectComponent implements OnInit, OnDestroy {
  project: FiniteAutomaton;

  @HostListener('document:keydown', ['$event']) onKeyDown($event: KeyboardEvent) { 
    let keyCode = $event.code;
    
    if($event.ctrlKey) {
      $event.preventDefault();
      $event.stopPropagation();
      switch(keyCode) {
        case "KeyO":
          this.openFile(this.parseAutomatonObject);
          break;
        case "KeyN":
          this.createNewFSM();
          break;
        case "KeyS":        
          this.saveProject(this.saveFilterFunction);
          break;
        default:
          super.onKeyDown($event);
      }       
    }
  }
    
  
  ngOnInit() {
    super.ngOnInit();

    if(this.appStateService.hasActiveProject) {
      this.project = this.appStateService.project as FiniteAutomaton;
      if(this.project.type != "finite-automaton") { // This should never happen
        this.router.navigateByUrl("/home", { replaceUrl: true });
      }
    } else {
      this.createNewFSM();     
    }
  }

  onToolClicked($event: ToolEvent) {
    switch($event.target) {
      case "new":
        this.createNewFSM();
        break;
      case "open":
        this.openFile(this.parseAutomatonObject);
        break;
      case "save":
        this.saveProject(this.saveFilterFunction);
        break;
      default:
        super.onToolClicked($event);
    }
  }

  createNewFSM() {
    this.newProject(new FiniteAutomaton(true), "New Finite State Automaton", "/finite/options");
  }

  parseAutomatonObject(rawAutomaton: FiniteAutomaton): FiniteAutomaton {
    let automaton = new FiniteAutomaton(rawAutomaton.isDeterministic);
    automaton.metadata = rawAutomaton.metadata;

    rawAutomaton.alphabet.symbols.forEach((symbol) => {
      automaton.alphabet.addSymbol(new AlphabetSymbol(symbol.symbol));
    })

    rawAutomaton.states.forEach((rawState) => {
      let newState = automaton.createState(rawState.layoutPosition);
      newState.id = rawState.id;
      newState.name = rawState.name;
      newState.type = rawState.type;
    });

    rawAutomaton.states.forEach((rawState, i) => {
      rawState.transitions.forEach((rawTransition, j) => {
        let destinationState = automaton.states.find((state) => {
          return state.id == (rawTransition.destination as any);
        }); 
        
        let newTransition = automaton.states[i].addTransition(destinationState);

        newTransition.shouldDuplicateLayout = rawTransition.shouldDuplicateLayout;

        rawTransition.conditions.forEach((condition) => {
          newTransition.addCondition(condition);
        });
      });
    });
    
    automaton.stateAutoIncrement = rawAutomaton.stateAutoIncrement;

    return automaton;
  }

  saveFilterFunction(key, value) {
    if(key == 'origin' || key == 'destination') {
      return value.id;
    } else if(["selectedState", "selectedTransition", "activeElement"].includes(key)) {
      return undefined;
    } else {
      return value;
    }
  }
}
