import { Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import { AppStateService } from '../app-state.service';
import { Automata, State, Transition, Coords, AlphabetSymbol } from '../automata';
import { FiniteAutomata } from './finite-automata';

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
  automata: FiniteAutomata;

  get simSpeed(): number {
    return this.speed;
  }

  get startText(): string {
    if(typeof(this.simulation) != "undefined" && this.simulation != null && this.simulation.isRunning) {
      return "Pause";
    } else if(this.simulation != null  && this.simulation.hasRemainingElements()) {
      return "Resume";
    } else if(this.simulation != null) {
      return "Restart";
    }
    return "Start";
  }

  constructor(private appStateService: AppStateService) {}
  
  ngOnInit() {
    this.automata = this.appStateService.project as FiniteAutomata;
    alertify.logPosition("top right");
  }

  ngOnDestroy() {

  } 

  toggleState() {
    let error = this.validateAutomata();
    if(error != null) {
      return this.outputError(error);
    }

    if(typeof(this.simulation) != "undefined" && this.simulation != null && this.simulation.isRunning) {
      this.stopSimulation();
    } else if(this.simulation != null  && this.simulation.hasRemainingElements()) {
      this.resumeSimulation();
    } else if(this.simulation != null) {
      this.reset();
      this.startSimulation();
    } else {
      this.startSimulation();      
    }
  }

  startSimulation() {
    let couldCreateSimulation = this.createSimulation();
    if(couldCreateSimulation) {
      this.simulation.startInterval(2000 - this.speed * 20);
    }
  }

  stopSimulation() {
    this.simulation.stopInterval();
  }

  resumeSimulation() {
    this.simulation.startInterval(2000 - this.speed * 20);
  }

  createSimulation(): boolean {
    if(this.validateWord(this.inputWord)) {
      this.simulation = new Simulation(this.automata);
      this.simulation.initializeSimulation(this.inputWord);
      return true;
    } else {
      alertify.error("The input word contains symbols not in the alphabet.");
      return false;
    }
  }

  step() {
    let error = this.validateAutomata();
    if(error != null) {
      return this.outputError(error);
    }

    if(typeof(this.simulation) == "undefined" || this.simulation == null) {
      let couldCreateSimulation = this.createSimulation();
      if(couldCreateSimulation) {        
        this.simulation.step();
      }
    } else {
      this.simulation.step();
    }

  }

  outputError(error: ValidationError) {
    console.log(error);
    alertify.error(error.errorMessage);
    if(error.culprit != null) {
      this.automata.incorrectElement = error.culprit;
    }
    setTimeout(() => {
      this.automata.incorrectElement = null;
    }, 5000);
  }

  reset() {
    this.automata.activeElement = null;
    if(this.simulation != null) {
      this.simulation.stopInterval();
      this.simulation = null;
    }
  }

  // Returns null if the automata is valid, else the error object
  validateAutomata(): ValidationError {
    let automata = this.automata, 
      initialStates = 0,
      finalStates = 0,
      alphabetSymbols = automata.alphabet.symbols.length,
      isDeterministic = automata.isDeterministic;
    
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
          if(state.transitions[j].conditions.length == 0) {
            return new ValidationError("A DFA can't have Kleene Closures", state);
          }
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

  validateWord(word: string) {
    let alphabet = this.automata.alphabet.symbols;
    for(let i = 0; i < word.length; i++) {
      let contained = false;
      for(let j = 0; j < alphabet.length; j++) {
        if(word[i] == alphabet[j].symbol) {
          contained = true;
          break;
        }        
      }
      if(!contained) return false;
    }
    return true;
  }

}

class Simulation {
  inputWord: string;
  initialState: State;
  stepInterval: any;
  automata: FiniteAutomata;
  traversalStack: TraversalElement[];
  currentElement: TraversalElement;
  lastDepth: number;
  reachedValidity: boolean;
  

  get isRunning() {
    return this.stepInterval != null;
  }

  constructor(automata: FiniteAutomata) {
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

  hasRemainingElements(): boolean {
    return this.traversalStack.length > 0;
  }

  initializeSimulation(word: string) {
    this.automata.activeElement = this.initialState;
    this.inputWord = word;
    this.lastDepth = 0;
    this.reachedValidity = false;
    this.traversalStack = [new TraversalState(0, "state", this.initialState)];
  }

  startInterval(interval: number) {
    this.step();
    this.stepInterval = setInterval(() => {
      this.step();
    }, interval);
  }

  stopInterval() {
    clearInterval(this.stepInterval);
    this.stepInterval = null;
  }

  step() {
    this.currentElement = this.traversalStack.pop();

    if(typeof(this.currentElement) == "undefined") { // Our traversal stack is empty
      if(this.startInterval != null) { // Pause the simulation
        this.stopInterval();
      }
      if(this.lastDepth + 1 < this.inputWord.length && !this.reachedValidity) {
        // We ran out of states and we still hadn't processed the word or validated it in another branch       
        alertify.log("The word is invalid");
      }
      return; // Stop the step
    } 

    if(this.currentElement.type == "state") {
      let stateTraversalElement = this.currentElement as TraversalState,
        state = stateTraversalElement.state,
        inputSymbol = this.inputWord[stateTraversalElement.depth];

      this.automata.activeElement = state;
      this.lastDepth =stateTraversalElement.depth;
      
      if(typeof(inputSymbol) == "undefined") { // We reached the end of the word
        if(state.type == "final" || state.type == "ambivalent") {
          alertify.success("The word is valid");
          this.reachedValidity = true; // If this is a final state, we win!
        } else if(this.traversalStack.length == 0 && !this.reachedValidity) {
          alertify.log("The word is invalid"); // Else, if there is nothing more in the stack we lose.
        }
      } else { // If we still have a word, get ready to branch
        for(let i = state.transitions.length - 1; i >= 0; i--) {
          let transition = state.transitions[i]; // For every transition that matches our condition, push it to the stack
          if(transition.conditions.length == 0 
             || transition.hasCondition(new AlphabetSymbol(inputSymbol))) {
               if(transition.conditions.length == 0) { // Kleene Closures should not consume the string
                this.traversalStack.push(new TraversalTransition(
                  stateTraversalElement.depth - 1, "transition", transition));
               } else { 
                this.traversalStack.push(new TraversalTransition(
                  stateTraversalElement.depth, "transition", transition));
               }
          }
        }
      }      
    } else { // If this is a transition, just mark it as active for the front end and push the state to the next stack
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
