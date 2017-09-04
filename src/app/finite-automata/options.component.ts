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
    this.appStateService.globalState.automata.alphabet.removeSymbol(symbolToRemove);
  }

  addSymbolToAlphabet() {      
    if(this.editorSymbol.trim() != '') {// Prevent empty symbols
      let symbolArray = this.editorSymbol.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        let symbol = new AlphabetSymbol(stringSymbol.trim());
        if(symbol.symbol != "") {
          this.appStateService.globalState.automata.alphabet.addSymbol(symbol);
        }
      });
    }
    this.editorSymbol = "";
  }  
}
