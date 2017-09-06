import { Component, OnInit } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { AlphabetSymbol } from '../automata';
import { FiniteAutomata } from './finite-automata';


@Component({
  templateUrl: './options.component.html'
})
export class OptionsComponent implements OnInit {
  //private editorSymbol: string;
  private automata: FiniteAutomata;

  constructor(private appStateService: AppStateService) {}

  ngOnInit() {
    this.automata = this.appStateService.project as FiniteAutomata;
  }

  setFiniteAsDeterministic(isDeterministic: boolean) {
    this.automata.isDeterministic = isDeterministic;
  }

  removeSymbolFromAlphabet(symbolToRemove: AlphabetSymbol) {
    this.automata.removeSymbol(symbolToRemove);
  }

  addSymbolToAlphabet(editorSymbol: string) {      
    if(editorSymbol.trim() != '') {// Prevent empty symbols
      let symbolArray = editorSymbol.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        let symbol = new AlphabetSymbol(stringSymbol.trim());
        if(symbol.symbol != "") {
          this.automata.alphabet.addSymbol(symbol);
        }
      });
    }
  }  
}
