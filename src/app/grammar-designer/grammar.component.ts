import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormalGrammar, GrammarType, GrammarSymbol, ProductionRule } from './formal-grammar';
import { ProjectComponent } from '../project.component'
import { ToolEvent } from '../toolbar.component';

declare var alertify;

@Component({
  templateUrl: './grammar.component.html',
  styleUrls: ['./grammar.component.css']
})
export class GrammarComponent extends ProjectComponent implements OnInit, OnDestroy {
  project: FormalGrammar

  ngOnInit() {
    super.ngOnInit();
    if (this.appStateService.hasActiveProject) {
      this.project = this.appStateService.project as FormalGrammar;
      if (this.project.type != "formal-grammar") { // This should never happen
        this.router.navigateByUrl("/home", { replaceUrl: true });
      }
    } else {
      this.newProject(new FormalGrammar(GrammarType.RegularGrammar), "New Formal Grammar");
    }
  }

  onToolClicked($event: ToolEvent) {
    switch ($event.target) {
      case "new":
        this.newProject(new FormalGrammar(GrammarType.RegularGrammar), "New Formal Grammar");
        break;
      case "open":
        this.openFile(this.parseGrammarObject);
        break;
      case "save":
        this.saveProject((key, value) => {
          return value;
        });
        break;
      default:
        super.onToolClicked($event);
    }
  }

  changeType(newType: GrammarType) {
    this.project.grammarType = newType;
    this.project.metadata.isUnsaved = true;
  }

  parseGrammarObject(rawGrammar: FormalGrammar): FormalGrammar {
    let grammar = new FormalGrammar(rawGrammar.grammarType);
    grammar.metadata = rawGrammar.metadata;

    return grammar;
  }

  removeSymbolFromGrammar(symbolToRemove: GrammarSymbol) {
    this.project.removeSymbol(symbolToRemove);
    this.project.metadata.isUnsaved = true;
  }

  addSymbolToGrammar(rawSymbol: string, isTerminal: boolean) {
    if (rawSymbol.trim() != '') {// Prevent empty symbols
      let symbolArray = rawSymbol.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        let symbol = new GrammarSymbol(stringSymbol.trim());
        if (symbol.symbol != "") {
          this.project.addSymbol(symbol, isTerminal);
          this.project.metadata.isUnsaved = true;
        }
      });
    }
  }

  setSymbolAsStart(symbol: GrammarSymbol) {
    this.project.selectStartSymbol(symbol);
  }

  createProductionRule(leftHand: string, rightHand: string) {
    let left = leftHand.trim(),
      right = rightHand.trim();
    if (left != '') {// Prevent empty left hand sides
      let leftSymbols = this.matchRawSymbols(left),
        rightSymbols = this.matchRawSymbols(right);

      this.project.addRule(new ProductionRule(leftSymbols, rightSymbols));
    } else {
      alertify.error("Left hand side of production rule cannot be empty.");
    }
  }

  removeRule(rule: ProductionRule) {
    this.project.removeRule(rule);
  }

  matchRawSymbols(rawSymbolWord: string): GrammarSymbol[] {
    let validSymbols = this.project.nonterminalSymbols.concat(this.project.terminalSymbols),
      detectedSymbols: GrammarSymbol[] = [];
    
    if(rawSymbolWord.indexOf(",") != -1) { // if it is a comma separated list, iteratively recurse into it
      let words = rawSymbolWord.split(",");
      words.forEach((word) => {
        detectedSymbols = detectedSymbols.concat(this.matchRawSymbols(word));
      });
      return detectedSymbols;
    } else {
      for (let i = 0; i < rawSymbolWord.length;) {
        let contained = false;
        for(let j = rawSymbolWord.length; j > i && !contained; j--) {
          let substr = rawSymbolWord.slice(i,j);
          for (let k = 0; k < validSymbols.length; k++) {
            if (substr == validSymbols[k].symbol) {
              contained = true;
              detectedSymbols.push(validSymbols[k]);
              i += j - i;
              break;
            }
          }
        }
        if (!contained) {
          alertify.error("The word contains undefined symbols.");
          throw "Undefined symbols in word";
        }
      }
      return detectedSymbols;
    }
  }
}
