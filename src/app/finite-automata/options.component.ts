import { Component } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { AlphabetSymbol } from '../automata';


@Component({
  templateUrl: './options.component.html'
})
export class OptionsComponent {
  editorSymbol: string;

  constructor(private appStateService: AppStateService) {}

  setFiniteAsDeterministic(isDeterministic: Boolean) {
    this.appStateService.globalState.automata.properties.isDeterministic = isDeterministic;
  }

  removeSymbolFromAlphabet(symbolToRemove: AlphabetSymbol) {
    this.appStateService.globalState.automata.removeSymbolFromAlphabet(symbolToRemove);
  }

  addSymbolToAlphabet() {      
    if(this.editorSymbol.trim() != '') {// Prevent empty symbols
      let symbol = new AlphabetSymbol(this.editorSymbol);
      this.appStateService.globalState.automata.addSymbolToAlphabet(symbol);
    }
    this.editorSymbol = "";
  }  
}
