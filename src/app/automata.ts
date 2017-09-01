export class Automata {
    type: string;
    states: State[];
    selectedState: State;
    alphabet: Alphabet;
    properties;

    constructor(type: string) {
        this.type = type;
        this.states = [];
        this.selectedState = null;
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
    layoutPosition: Coords;    

    constructor(name: string, type: string, position: Coords) {
        this.name = name;
        this.type = type;
        this.layoutPosition = position;
        this.transitions = [];
    }

    get transformPosition() {
        let position = "translate(" + (this.layoutPosition.x - 30) + "px, " 
        + (this.layoutPosition.y - 30) +"px)";
        return position;
    }

    addTransition(to: State) {
        let hasTransition = false;
        for(let i = 0; i < this.transitions.length && !hasTransition; i++) {
            hasTransition = this.transitions[i].destination == to;
        }
        if(!hasTransition) {
            this.transitions.push(new Transition(this, to));
        }
    }
}

export class Transition {
    origin: State;
    destination: State;
    conditions: AlphabetSymbol[];

    constructor(origin: State, destination: State) {
        this.origin = origin;
        this.destination = destination;
        this.conditions = [];
    }

    get transformPosition() {
        let x = (this.origin.layoutPosition.x + this.destination.layoutPosition.x) / 2,
            y = (this.origin.layoutPosition.y + this.destination.layoutPosition.y) / 2,
            angle = Math.atan(  (this.destination.layoutPosition.y - this.origin.layoutPosition.y)
                              / (this.destination.layoutPosition.x - this.origin.layoutPosition.x));
        
        x -= this.origin.layoutPosition.x;
        y -= this.origin.layoutPosition.y;
        angle *= 180 / Math.PI; // Convert to degrees

        return "translate(" + x + "px, " + y + "px) rotate(" + angle + "deg)";          
    }

    get width() {
        return this.origin.layoutPosition.distanceTo(this.destination.layoutPosition) - 60;
    }
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
        let setString = "",
            lastIndex = this.symbols.length - 1;
        this.symbols.forEach((symbol, index) => {
            setString += symbol.symbol;
            if(index != lastIndex) {
                setString += ", ";
            } 
        });
        return '\u03A3 = {' + setString + '}';
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

export class Coords {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    distanceTo(point: Coords) {
        return Math.sqrt(this.squareDistanceTo(point));
    }

    squareDistanceTo(point: Coords) {
        return Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2);
    }
}