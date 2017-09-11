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
  expansionTreeRoot: TreeNode = null;

  get expansionTree(): TreeNode[][] {
    if(this.expansionTreeRoot != null) {
      let baseArray: TreeNode[][] = [],
        buildTreeRepresentation = (node: TreeNode, baseArray: TreeNode[][]) => {
          if(typeof baseArray[node.depth] === "undefined") {
            baseArray[node.depth] = [];
          }

          baseArray[node.depth].push(node);
          
          node.children.forEach((child) => {
            buildTreeRepresentation(child, baseArray);
          });
        };

      buildTreeRepresentation(this.expansionTreeRoot, baseArray);

      console.log(baseArray);

      return baseArray;
    }
    return null;
  }

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

    // TODO: Parse gramamr object

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

  matchRawSymbols(rawSymbolWord: string, onlyTerminals = false): GrammarSymbol[] {
    let validSymbols,
      detectedSymbols: GrammarSymbol[] = [];
      
    rawSymbolWord = rawSymbolWord.replace(" ", "");

    if(onlyTerminals) {
      validSymbols = this.project.terminalSymbols;
    } else {
      validSymbols = this.project.nonterminalSymbols.concat(this.project.terminalSymbols)
    }
    
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

  testWord(word: string) {
    this.validateProductionRules();
    let wordSymbols = this.matchRawSymbols(word, true),
      start = this.project.startRule,
      maxLength = wordSymbols.length,
      currentDepthMembers: TreeNode[] = [],
      foundValidWord = false;

    if(start == null) {
      alertify.error("No start rule set.");
      throw "No start rule set.";
    }

    this.expansionTreeRoot = new TreeNode(0, start.rightHandSide);
    
    currentDepthMembers.push(this.expansionTreeRoot);


    while(!foundValidWord) {
      let newChildren: TreeNode[] = [],
        exhausted = false;

      currentDepthMembers.forEach((node) => {
        let newestChildren: TreeNode[] = this.createChildren(node, wordSymbols);

        if(!foundValidWord && newestChildren.some(child => child.isSpecial)) {
          foundValidWord = true;
        }

        newChildren = newChildren.concat(newestChildren);
      });

      exhausted = newChildren.every((child) => {
        let terminals = child.value.filter(s => this.project.terminalSymbols.includes(s));
        return terminals.length > wordSymbols.length;
      });

      if(newChildren.length == 0 || exhausted) break; // Cannot expand any further

      currentDepthMembers = newChildren;
    }
    

    if(foundValidWord) {
      alertify.success("The word is valid.");
    } else {
      alertify.log("The word is invalid.");
    }    
  }

  createChildren(node: TreeNode, targetWord: GrammarSymbol[] = null): TreeNode[] {
    let possibleExpansions = this.expandWord(node.value),
      childrenDepth = node.depth + 1;

    possibleExpansions.map((expansion) => {
      let newNode = new TreeNode(childrenDepth, expansion);

      if(targetWord != null && newNode.value.length == targetWord.length) {
        newNode.isSpecial = true; // Start assuming it is equal
        for(let i = 0; i < newNode.value.length && newNode.isSpecial; i++) {
          if(newNode.value[i] != targetWord[i]) newNode.isSpecial = false;
        }        
      }

      node.children.push(newNode)
    });

    return node.children;
  }

  expandWord(symbols: GrammarSymbol[], onlyFirstNonTerminal = true): GrammarSymbol[][] {
    let expansions: GrammarSymbol[][] = [];
      
    for(let symbolIndex = 0; symbolIndex < symbols.length; symbolIndex++) {
      let symbol = symbols[symbolIndex];
      if(this.project.nonterminalSymbols.includes(symbol)) {
        let appropiateRules = this.project.getRulesforSymbol(symbol);
        
        appropiateRules.forEach((rule) => {
          let newExpansion = symbols.map((s, i) => {
            if(i == symbolIndex) {
              return rule.rightHandSide;
            } else {
              return s;
            }
          });        
          
          expansions.push([].concat.apply([], newExpansion));

        });        
        
        if(onlyFirstNonTerminal) break;
      }
    }

    return expansions;
  }

  validateProductionRules() {
    let validSymbols = this.project.nonterminalSymbols.concat(this.project.terminalSymbols);
    for(let i = 0; i < this.project.productionRules.length; i++) {
      let rule = this.project.productionRules[i];
      let isSubset = !rule.leftHandSide.some(symbol => validSymbols.indexOf(symbol) === -1);
      isSubset = isSubset && !rule.rightHandSide.some(symbol => validSymbols.indexOf(symbol) === -1);
      if(!isSubset) {
        alertify.error("The production rules contain undefined symbols.");
        throw "The production rules contain undefined symbols.";
      }
    }
  }
}

class TreeNode {
  depth: number;
  children: TreeNode[];
  value: GrammarSymbol[];
  isSpecial: boolean;

  constructor(depth, value, isSpecial = false) {
    this.depth = depth;
    this.value = value;
    this.isSpecial = isSpecial;
    this.children = [];
  }
}