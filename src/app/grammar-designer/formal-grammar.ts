import { Project } from '../project';

export class FormalGrammar extends Project {
    grammarType: GrammarType;
    terminalSymbols: GrammarSymbol[];
    nonterminalSymbols: GrammarSymbol[];
    productionRules: ProductionRule[];

    constructor(grammarType: GrammarType) {
        super('formal-grammar')
        this.grammarType = grammarType;
        this.terminalSymbols = [];
        this.nonterminalSymbols = [];
        this.productionRules = [];
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
            if (this.productionRules[i] == rule) return true;
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

    getFormalString(fromTerminals: boolean) {
        let iterable;
        if (fromTerminals) {
            iterable = this.terminalSymbols;
        } else {
            iterable = this.nonterminalSymbols;
        }

        if (iterable.length > 0) {
            let setString = "",
                lastIndex = iterable.length - 1;
            iterable.forEach((symbol, index) => {
                setString += symbol.symbol;
                if (index != lastIndex) {
                    setString += ", ";
                }
            });
            return '\u03A3 = {' + setString + '}';
        }
        return '\u03A3 = { \u2205 }';
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
    righthandSide: GrammarSymbol[];
}