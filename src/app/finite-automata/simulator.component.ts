import { Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import { AppStateService } from '../app-state.service';
import { Automata, State, Transition, Coords, AlphabetSymbol } from '../automata';

declare var alertify;

@Component({
  selector: 'simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit, OnDestroy {
  inputWord: string = "";
  speed: number = 50;
  simulation: Simulation;

  get simSpeed(): number {
    return this.speed;
  }

  constructor(private appStateService: AppStateService) {}
  
  ngOnInit() {
    alertify.logPosition("top right");
  }

  ngOnDestroy() {

  } 

  toggleState() {
    let error = this.validateAutomata();
    if(error != null) {
      return this.outputError(error);
    }

    if(typeof(this.simulation) == "undefined" || this.simulation == null) {
      this.startSimulation();
    } else if(this.simulation.isRunning) {
      this.stopSimulation();
    } else {
      this.resumeSimulation();
    }
  }

  startSimulation() {
    this.createSimulation();
    this.simulation.startInterval(2000 - this.speed * 20)
  }

  stopSimulation() {

  }

  resumeSimulation() {

  }

  createSimulation() {
    this.simulation = new Simulation(this.appStateService.globalState.automata);
    this.simulation.initializeSimulation(this.inputWord);
  }

  step() {
    let error = this.validateAutomata();
    if(error != null) {
      return this.outputError(error);
    }

    if(typeof(this.simulation) == "undefined" || this.simulation == null) {
      this.createSimulation();
    } 

    this.simulation.step();
  }

  outputError(error: ValidationError) {
    console.log(error);
    alertify.error(error.errorMessage);
    if(error.culprit != null) {
      this.appStateService.globalState.automata.incorrectElement = error.culprit;
    }
    setTimeout(() => {
      this.appStateService.globalState.automata.incorrectElement = null;
    }, 5000);
  }

  reset() {
    this.appStateService.globalState.automata.activeElement = null;
    this.simulation = null;
  }

  // Returns null if the automata is valid, else the error object
  validateAutomata(): ValidationError {
    let automata = this.appStateService.globalState.automata, 
      initialStates = 0,
      finalStates = 0,
      alphabetSymbols = automata.alphabet.symbols.length,
      isDeterministic = automata.properties.isDeterministic;
    
    for(let i = 0; i < automata.states.length; i++) {
      let state = automata.states[i];

      if(state.type == "initial" || state.type == "ambivalent") {
        if(++initialStates > 1) {
          return new ValidationError("An automata can only have one initial state", state);
        }
      }

      if(state.type == "final" || state.type == "ambivalent") {
        finalStates++;
      }

      if(isDeterministic) {
        let conditions = [];

        for(let j = 0; j < state.transitions.length; j++) {
          conditions = conditions.concat(state.transitions[j].conditions)
        }

        if(conditions.length < alphabetSymbols) {
          return new ValidationError("A DFA state must have a transition for each symbol in the alphabet.", state);
        } else if(this.hasRepeatedConditions(conditions)) {
          return new ValidationError("A DFA can only have one transition for each symbol in the alphabet.", state);
        }
      }      
    }

    if(finalStates == 0) {
      return new ValidationError("There must be at least one final state", null);
    }
    return null;
  }

  hasRepeatedConditions(conditions): boolean {
    // If we have repeated symbols
    let seenSymbols = [];
    for(let i = 0; i < conditions.length; i++) {
      if(seenSymbols.includes(conditions[i].symbol)) {
        console.log(conditions, seenSymbols);
        return true;
      }
      seenSymbols.push(conditions[i].symbol)
    }
    return false;
  }

}

class Simulation {
  inputWord: string;
  initialState: State;
  stepInterval: any;
  automata: Automata;
  traversalStack: TraversalElement[];
  currentElement: TraversalElement;
  lastDepth: number;
  

  get isRunning() {
    return this.stepInterval != null;
  }

  constructor(automata: Automata) {
    this.automata = automata;
    this.stepInterval = null;

    for(let i = 0; i < automata.states.length; i++) {
      if(automata.states[i].type == "initial" 
          || automata.states[i].type == "ambivalent") {
        this.initialState = automata.states[i];
        break;
      }
    }
  }

  initializeSimulation(word: string) {
    this.automata.activeElement = this.initialState;
    this.inputWord = word;
    this.traversalStack = [new TraversalState(0, "state", this.initialState)];
  }

  startInterval(interval: number) {
    this.step();
    this.stepInterval = setInterval(() => {
      this.step();
    }, interval);
  }

  step() {
    this.currentElement = this.traversalStack.pop();

    if(typeof(this.currentElement) == "undefined") {
      if(this.startInterval != null) {
        clearInterval(this.stepInterval);
      }
      if(this.lastDepth + 1 < this.inputWord.length) {
        alertify.log("The word is invalid");
      }
      return;
    } 

    this.lastDepth == this.currentElement.depth;

    if(this.currentElement.type == "state") {
      let stateTraversalElement = this.currentElement as TraversalState,
        state = stateTraversalElement.state,
        inputSymbol = this.inputWord[stateTraversalElement.depth];

      this.automata.activeElement = state;

      console.log(this.inputWord.slice(stateTraversalElement.depth), stateTraversalElement.depth);
      
      if(typeof(inputSymbol) == "undefined") {
        console.info("Reached end of word");
        console.log(state);
        if(state.type == "final" || state.type == "ambivalent") {
          alertify.success("The word is valid");
        } else if(this.traversalStack.length == 0) {
          alertify.log("The word is invalid");
        }
      } else {
        for(let i = state.transitions.length - 1; i >= 0; i--) {
          let transition = state.transitions[i];
          if(transition.conditions.length == 0 
             || transition.hasCondition(new AlphabetSymbol(inputSymbol))) {
              this.traversalStack.push(new TraversalTransition(
                stateTraversalElement.depth, "transition", transition));
          }
        }
      }      
    } else {
      let transitionTraversalElement = this.currentElement as TraversalTransition,
        transition = transitionTraversalElement.transition,
        destinationState = transition.destination;

      this.automata.activeElement = transition;

      this.traversalStack.push(new TraversalState(
          transitionTraversalElement.depth + 1, "state", destinationState));
    }
  }


}

class TraversalElement {
  type: string;
  depth: number;

  constructor(depth: number, type: string) {
    this.type = type;
    this.depth = depth;
  }
}

class TraversalState extends TraversalElement {
  state: State;

  constructor(depth: number, type: string, state: State) {
    super(depth, type);
    this.state = state;
  }
}

class TraversalTransition extends TraversalElement {
  transition: Transition;

  constructor(depth: number, type: string, transition: Transition) {
    super(depth, type);
    this.transition = transition;
  }
}

class ValidationError {
  errorMessage: string;
  culprit: State;

  constructor(errorMsg: string, culprit: State) {
    this.errorMessage = errorMsg;
    this.culprit = culprit;
  }
}
