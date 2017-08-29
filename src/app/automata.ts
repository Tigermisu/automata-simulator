export class Automata {
    type: string;
    states: State[];
    alphabet: Alphabet;
    properties;

    constructor(type: string) {
        this.type = type;
        this.states = [];
        this.alphabet = new Alphabet();
        this.properties = {};
    }

    addSymbolToAlphabet(symbol: AlphabetSymbol) {  
        let repeatedSymbol = this.alphabet.hasSymbol(symbol);
        if(!repeatedSymbol) this.alphabet.symbols.push(symbol);
    }

    removeSymbolFromAlphabet(symbol: AlphabetSymbol) {
        let index = this.alphabet.symbols.indexOf(symbol);
        if(index != -1) this.alphabet.symbols.splice(index, 1);
    }
}

export class State {
    name: string;
    type: string;
    transitions: Transition[];
    layoutPosition: Position;    
}

export class Transition {
    origin: State;
    destination: State;
    conditions: AlphabetSymbol[];
}

export class Alphabet {
    symbols: AlphabetSymbol[];

    constructor() {
        this.symbols = [];
    }

    hasSymbol(symbol: AlphabetSymbol) {
        for(let i = 0; i < this.symbols.length; i++) {
            if(this.symbols[i].symbol == symbol.symbol) return true;
        }
        return false;
    }

    getFormalString() {
        return '\u03A3 = {}';
    }
}

export class AlphabetSymbol {
    symbol: string;

    constructor(symbol: string) {
        this.symbol = symbol;
    }

    toString() {
        return this.symbol;
    }
}