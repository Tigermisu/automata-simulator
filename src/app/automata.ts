export class Automata {
    private stateAutoIncrement: number
    type: string;
    states: State[];
    selectedState: State;
    selectedTransition: Transition;
    alphabet: Alphabet;
    properties;

    constructor(type: string) {
        this.type = type;
        this.states = [];
        this.selectedState = null;
        this.selectedTransition = null;
        this.alphabet = new Alphabet();
        this.properties = {};
        this.stateAutoIncrement = 0;
    }

    addSymbolToAlphabet(symbol: AlphabetSymbol) {  
        let repeatedSymbol = this.alphabet.hasSymbol(symbol);
        if(!repeatedSymbol) this.alphabet.symbols.push(symbol);
    }

    createState(position: Coords) {
        let stateNumber = this.stateAutoIncrement++,
        state = new State("q" + stateNumber, "normal", new Coords(position.x, position.y));
        
        if(stateNumber == 0) state.type = "initial";
  
        this.states.push(state);
    }

    removeSymbolFromAlphabet(symbol: AlphabetSymbol) {
        let index = this.alphabet.symbols.indexOf(symbol);
        if(index != -1) this.alphabet.symbols.splice(index, 1);
    }

    deleteState(state: State) {
        let index = this.states.indexOf(state);
        this.states.splice(index, 1);
        this.states.forEach(currentState => {
            currentState.transitions = currentState.transitions.filter((transition) => {
                return transition.destination != state;
            });
        })
    }

    deleteTransition(transition: Transition) {
        let index = transition.origin.transitions.indexOf(transition);
        transition.origin.transitions.splice(index, 1);
        if(transition.shouldDuplicateLayout != 0) {
            transition.destination.transitions.forEach((tr) => {
                if(tr.destination == transition.origin) {
                    tr.shouldDuplicateLayout = 0;
                }
            });
        }
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

    addTransition(to: State): Transition {
        for(let i = 0; i < this.transitions.length; i++) {
            if(this.transitions[i].destination == to) {
                return this.transitions[i]; // Prevent duplicate transitions
            }
        }
        
        this.transitions.push(new Transition(this, to));
        return this.transitions[this.transitions.length - 1];
    }

    setType(type: string) {
        this.type = type;
    }
}

export class Transition {
    origin: State;
    destination: State;
    conditions: AlphabetSymbol[];
    shouldDuplicateLayout: number;
    hasRightArrow: Boolean;

    constructor(origin: State, destination: State) {
        this.origin = origin;
        this.destination = destination;
        this.conditions = [];
        this.shouldDuplicateLayout = 0;
        this.hasRightArrow = true;

        for(let i = 0; i < destination.transitions.length && this.shouldDuplicateLayout == 0; i++) {
            if(destination.transitions[i].destination == origin) {
                destination.transitions[i].shouldDuplicateLayout = 1;
                this.shouldDuplicateLayout = -1;
            }
        }
    }

    get conditionsString() {
        let setString = "",
            lastIndex = this.conditions.length - 1;
        this.conditions.forEach((symbol, index) => {
            setString += symbol.symbol;
            if(index != lastIndex) {
                setString += ", ";
            } 
        });
        return setString;
    }

    get midPoint(): Coords {
        let x = (this.origin.layoutPosition.x + this.destination.layoutPosition.x) / 2,
        y = (this.origin.layoutPosition.y + this.destination.layoutPosition.y) / 2;

        return new Coords(x, y);
    }

    get transformPosition() {
        if(this.origin == this.destination) {
            return "translate(0, -45px)";
        }
        let midPoint = this.midPoint,
            x = midPoint.x,
            y = midPoint.y,
            angle = Math.atan(  (this.destination.layoutPosition.y - this.origin.layoutPosition.y)
                              / (this.destination.layoutPosition.x - this.origin.layoutPosition.x));
        
        x -= this.origin.layoutPosition.x;
        y -= this.origin.layoutPosition.y;

        
        if((x < 0 && y <= 0) || (x < 0 && y > 0)) {
            this.hasRightArrow = false;
        } else {
            this.hasRightArrow = true;
        }
        
        if(this.shouldDuplicateLayout != 0) { // Prevent most states from having to 4 comparisons
            if((this.shouldDuplicateLayout == 1 && x >= 0) || (this.shouldDuplicateLayout == -1 && x < 0)) {
                y -= Math.cos(angle) * 8 * this.shouldDuplicateLayout;
                x += Math.sin(angle) * 8 * this.shouldDuplicateLayout;
            } else if((this.shouldDuplicateLayout == 1 && x < 0) || (this.shouldDuplicateLayout == -1 && x >= 0)) {
                y += Math.cos(angle) * 8 * this.shouldDuplicateLayout;
                x -= Math.sin(angle) * 8 * this.shouldDuplicateLayout;
            }
        }

        angle *= 180 / Math.PI; // Convert to degrees

        return "translate(" + x + "px, " + y + "px) rotate(" + angle + "deg)";          
    }

    get width() {
        if(this.origin == this.destination) {
            return 45;
        }
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

    get formalString() {
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