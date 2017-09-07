import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { FiniteAutomaton } from './finite-automaton';
import { Subscription } from 'rxjs/Subscription';
import { AlphabetSymbol } from '../automaton';



@Component({
  templateUrl: './options.component.html'
})
export class OptionsComponent implements OnInit, OnDestroy {
  private projectSubscription: Subscription;
  private automaton: FiniteAutomaton;

  constructor(private appStateService: AppStateService) { }

  ngOnInit() {
    this.automaton = this.appStateService.project as FiniteAutomaton;
    this.projectSubscription = this.appStateService.projectChangedStream.subscribe((newProject) => {
      this.automaton = newProject as FiniteAutomaton;
    });
  }

  ngOnDestroy() {
    this.projectSubscription.unsubscribe();
  }

  setFiniteAsDeterministic(isDeterministic: boolean) {
    this.automaton.isDeterministic = isDeterministic;
    this.automaton.metadata.isUnsaved = true;
  }

  removeSymbolFromAlphabet(symbolToRemove: AlphabetSymbol) {
    this.automaton.removeSymbol(symbolToRemove);
    this.automaton.metadata.isUnsaved = true;
  }

  addSymbolToAlphabet(editorSymbol: string) {
    if (editorSymbol.trim() != '') {// Prevent empty symbols
      let symbolArray = editorSymbol.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        let symbol = new AlphabetSymbol(stringSymbol.trim());
        if (symbol.symbol != "") {
          this.automaton.alphabet.addSymbol(symbol);
          this.automaton.metadata.isUnsaved = true;
        }
      });
    }
  }
}
