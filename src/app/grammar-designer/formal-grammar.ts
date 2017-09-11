import { Project } from '../project';

export class FormalGrammar extends Project {
    grammarType: GrammarType;
    startSymbol: GrammarSymbol;
    terminalSymbols: GrammarSymbol[];
    nonterminalSymbols: GrammarSymbol[];
    productionRules: ProductionRule[];

    constructor(grammarType: GrammarType) {
        super('formal-grammar')
        this.grammarType = grammarType;
        this.terminalSymbols = [];
        this.nonterminalSymbols = [];
        this.productionRules = [];
        this.startSymbol = null;
    }

    get startFormalString(): string {
        if(this.startSymbol != null) {
            return "S = " + this.startSymbol.symbol;
        }
        return "<Please click on a symbol to designiate it as Start>";
    }

    get startRule(): ProductionRule {
        for(let i = 0; i < this.productionRules.length; i++) {
            if(this.productionRules[i].leftHandSide.length == 1
                && this.productionRules[i].leftHandSide[0] == this.startSymbol) {
                    return this.productionRules[i];
                }
        }
        return null;
    }

    selectStartSymbol(symbol: GrammarSymbol) {
        this.startSymbol = symbol;
    }

    addRule(rule: ProductionRule) {
        if (!this.hasRule(rule)) {
            this.productionRules.push(rule);
        }
    }

    removeRule(rule: ProductionRule) {
        let index = this.productionRules.indexOf(rule);
        if (index != -1) {
            this.productionRules.splice(index, 1);
        }
    }

    hasRule(rule: ProductionRule) {
        for (let i = 0; i < this.productionRules.length; i++) {
            if (this.productionRules[i].equals(rule)) return true;
        }
        return false;
    }

    addSymbol(s: GrammarSymbol, isTerminal: boolean) {
        if (!this.hasSymbol(s)) {
            let sortFunction = (a, b) => {
                if (a.symbol < b.symbol) return -1;
                if (a.symbol > b.symbol) return 1;
                return 0;
            }
            if (isTerminal) {
                this.terminalSymbols.push(s);
                this.terminalSymbols.sort(sortFunction);
            } else {
                this.nonterminalSymbols.push(s);
                this.nonterminalSymbols.sort(sortFunction);

                if(this.startSymbol == null && s.symbol == "S") {
                    this.startSymbol = s;
                }
            }
        }
    }

    removeSymbol(grammarSymbol: GrammarSymbol) {
        let index = this.terminalSymbols.indexOf(grammarSymbol);
        if (index != -1) {
            this.terminalSymbols.splice(index, 1);
        } else {
            index = this.nonterminalSymbols.indexOf(grammarSymbol);
            if (index != -1) {
                if(this.startSymbol == grammarSymbol) this.startSymbol = null;
                this.nonterminalSymbols.splice(index, 1);
            }
        }
    }

    hasSymbol(symbol: GrammarSymbol) {
        for (let i = 0; i < this.terminalSymbols.length; i++) {
            if (this.terminalSymbols[i].symbol == symbol.symbol) return true;
        }
        for (let i = 0; i < this.nonterminalSymbols.length; i++) {
            if (this.nonterminalSymbols[i].symbol == symbol.symbol) return true;
        }
        return false;
    }

    isNonterminalSymbol(symbol: GrammarSymbol): boolean {
        return this.nonterminalSymbols.includes(symbol);
    }

    getRulesforSymbol(symbol: GrammarSymbol): ProductionRule[] {
        if(this.isNonterminalSymbol(symbol)) {
            return this.productionRules.filter(rule => rule.leftHandSide.includes(symbol));
        }
        return [];    
    }

    getFormalString(fromTerminals: boolean) {
        let iterable, symbol;
        if (fromTerminals) {
            iterable = this.terminalSymbols;
            symbol = '\u03A3';
        } else {
            iterable = this.nonterminalSymbols;
            symbol = 'N';
        }

        if (iterable.length > 0) {
            let setString = "",
                lastIndex = iterable.length - 1,
                resultString;
            iterable.forEach((symbol, index) => {
                setString += symbol.symbol;
                if (index != lastIndex) {
                    setString += ", ";
                }
            });
            resultString = symbol + ' = {' + setString + '}';
            if(!fromTerminals) {
                return resultString += "  " + this.startFormalString;
            }
            return resultString;
        }
        return symbol +' = { \u2205 }';
    }
}

export enum GrammarType {
    RegularGrammar,
    TuringGrammar
}

export class GrammarSymbol {
    symbol: string;

    constructor(symbol: string) {
        this.symbol = symbol;
    }

    toString(): string {
        return this.symbol;
    }
}

export class ProductionRule {
    leftHandSide: GrammarSymbol[];
    rightHandSide: GrammarSymbol[];

    constructor(left, right) {
        this.leftHandSide = left;
        this.rightHandSide = right;
    }

    equals(rule: ProductionRule) {
        if(this.leftHandSide.length != rule.leftHandSide.length 
            || this.rightHandSide.length != rule.rightHandSide.length) {
                return false;
            }
        for(let i = 0; i < this.leftHandSide.length; i++) {
            if(this.leftHandSide[i] != rule.leftHandSide[i]) return false;
        }
        for(let i = 0; i < this.rightHandSide.length; i++) {
            if(this.rightHandSide[i] != rule.rightHandSide[i]) return false;
        }
        return true;
    }
}