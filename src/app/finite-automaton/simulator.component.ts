import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Automaton, State, Transition, Coords, AlphabetSymbol } from '../automaton';
import { AppStateService } from '../app-state.service';
import { FiniteAutomaton } from './finite-automaton';
import { Subscription } from 'rxjs/Subscription';

declare var alertify;

@Component({
  selector: 'simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.css']
})
export class SimulatorComponent implements OnInit, OnDestroy {
  private projectSubscription: Subscription;
  inputWord: string = "";
  speed: number = 50;
  simulation: Simulation;
  automaton: FiniteAutomaton;


  get simSpeed(): number {
    return this.speed;
  }

  get startText(): string {
    if (typeof (this.simulation) != "undefined" && this.simulation != null && this.simulation.isRunning) {
      return "Pause";
    } else if (this.simulation != null && this.simulation.hasRemainingElements()) {
      return "Resume";
    } else if (this.simulation != null) {
      return "Restart";
    }
    return "Start";
  }

  constructor(private appStateService: AppStateService) { }

  ngOnInit() {
    this.automaton = this.appStateService.project as FiniteAutomaton;
    alertify.logPosition("top right");
    this.projectSubscription = this.appStateService.projectChangedStream.subscribe((newProject) => {
      this.automaton = newProject as FiniteAutomaton;
    });
  }

  ngOnDestroy() {
    this.projectSubscription.unsubscribe();
  }

  toggleState() {
    let error = this.validateAutomaton();
    if (error != null) {
      return this.outputError(error);
    }

    if (typeof (this.simulation) != "undefined" && this.simulation != null && this.simulation.isRunning) {
      this.stopSimulation();
    } else if (this.simulation != null && this.simulation.hasRemainingElements()) {
      this.resumeSimulation();
    } else if (this.simulation != null) {
      this.reset();
      this.startSimulation();
    } else {
      this.startSimulation();
    }
  }

  startSimulation() {
    let couldCreateSimulation = this.createSimulation();
    if (couldCreateSimulation) {
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
    if (this.validateWord(this.inputWord)) {
      this.simulation = new Simulation(this.automaton);
      this.simulation.initializeSimulation(this.inputWord);
      return true;
    } else {
      alertify.error("The input word contains symbols not in the alphabet.");
      return false;
    }
  }

  updateSpeed(value: number) {
    if (!(typeof (this.simulation) == "undefined"
      || this.simulation == null
      || !this.simulation.isRunning)) {
      this.simulation.updateInterval(2000 - value * 20);
    }
  }

  step() {
    let error = this.validateAutomaton();
    if (error != null) {
      return this.outputError(error);
    }

    if (typeof (this.simulation) == "undefined" || this.simulation == null) {
      let couldCreateSimulation = this.createSimulation();
      if (couldCreateSimulation) {
        this.simulation.step();
      }
    } else {
      if (this.simulation.isRunning) {
        this.stopSimulation();
      }
      this.simulation.step();
    }

  }

  outputError(error: ValidationError) {

    alertify.error(error.errorMessage);
    if (error.culprit != null) {
      this.automaton.incorrectElement = error.culprit;
    }
    setTimeout(() => {
      this.automaton.incorrectElement = null;
    }, 5000);
  }

  reset() {
    this.automaton.activeElement = null;
    if (this.simulation != null) {
      this.simulation.stopInterval();
      this.simulation = null;
    }
  }

  // Returns null if the automaton is valid, else the error object
  validateAutomaton(): ValidationError {
    let automaton = this.automaton,
      initialStates = 0,
      finalStates = 0,
      alphabetSymbols = automaton.alphabet.symbols.length,
      isDeterministic = automaton.isDeterministic;

    for (let i = 0; i < automaton.states.length; i++) {
      let state = automaton.states[i];

      if (state.type == "initial" || state.type == "ambivalent") {
        if (++initialStates > 1) {
          return new ValidationError("An automaton can only have one initial state", state);
        }
      }

      if (state.type == "final" || state.type == "ambivalent") {
        finalStates++;
      }

      if (isDeterministic) {
        let conditions = [];

        for (let j = 0; j < state.transitions.length; j++) {
          if (state.transitions[j].conditions.length == 0) {
            return new ValidationError("A DFA can't have Kleene Closures", state);
          }
          conditions = conditions.concat(state.transitions[j].conditions)
        }

        if (conditions.length < alphabetSymbols) {
          return new ValidationError("A DFA state must have a transition for each symbol in the alphabet.", state);
        } else if (this.hasRepeatedConditions(conditions)) {
          return new ValidationError("A DFA can only have one transition for each symbol in the alphabet.", state);
        }
      }
    }

    if (finalStates == 0) {
      return new ValidationError("There must be at least one final state", null);
    }
    return null;
  }

  hasRepeatedConditions(conditions): boolean {
    // If we have repeated symbols
    let seenSymbols = [];
    for (let i = 0; i < conditions.length; i++) {
      if (seenSymbols.includes(conditions[i].symbol)) {
        return true;
      }
      seenSymbols.push(conditions[i].symbol)
    }
    return false;
  }

  validateWord(word: string) {
    let alphabet = this.automaton.alphabet.symbols;
    for (let i = 0; i < word.length;) {
      let contained = false;
      for(let j = word.length; j > i && !contained; j--) {
        let substr = word.slice(i,j);
        for (let k = 0; k < alphabet.length; k++) {
          if (substr == alphabet[k].symbol) {
            contained = true;
            i += j - i;
            break;
          }
        }
      }
      if (!contained) {
        return false;
      }
    }
    return true;
  }

}

class Simulation {
  inputWord: string;
  initialState: State;
  stepInterval: any;
  automaton: FiniteAutomaton;
  traversalStack: TraversalElement[];
  currentElement: TraversalElement;
  lastDepth: number;
  reachedValidity: boolean;


  get isRunning() {
    return this.stepInterval != null;
  }

  constructor(automaton: FiniteAutomaton) {
    this.automaton = automaton;
    this.stepInterval = null;

    for (let i = 0; i < automaton.states.length; i++) {
      if (automaton.states[i].type == "initial"
        || automaton.states[i].type == "ambivalent") {
        this.initialState = automaton.states[i];
        break;
      }
    }
  }

  hasRemainingElements(): boolean {
    return this.traversalStack.length > 0;
  }

  initializeSimulation(word: string) {
    this.automaton.activeElement = this.initialState;
    this.inputWord = word;
    this.lastDepth = 0;
    this.reachedValidity = false;
    this.traversalStack = [new TraversalState(0, "state", this.initialState)];

    this.automaton.selectedState = null;
    this.automaton.selectedTransition = null;
  }

  startInterval(interval: number) {
    this.step();
    this.stepInterval = setInterval(() => {
      this.step();
    }, interval + 20); // 20ms minimum -> 50 states per second
  }

  stopInterval() {
    clearInterval(this.stepInterval);
    this.stepInterval = null;
  }

  updateInterval(interval: number) {
    clearInterval(this.stepInterval);
    this.stepInterval = setInterval(() => {
      this.step();
    }, interval);
  }

  getTransitionSymbol(currentDepth): [AlphabetSymbol, number] {
    if(currentDepth >= this.inputWord.length) return [null, 0]
    let alphabet = this.automaton.alphabet.symbols
    for(let i = this.inputWord.length; i > currentDepth; i--) {
      let substr = this.inputWord.slice(currentDepth,i);
      for (let j = 0; j < alphabet.length; j++) {
        if (substr == alphabet[j].symbol) {
          return [alphabet[j], i - currentDepth];
        }
      }
    }    
    throw "Invalid symbol detected in simulation!";
  }

  step() {
    this.currentElement = this.traversalStack.pop();

    if (typeof (this.currentElement) == "undefined") { // Our traversal stack is empty
      if (this.startInterval != null) { // Pause the simulation
        this.stopInterval();
      }
      if (this.lastDepth + 1 < this.inputWord.length && !this.reachedValidity) {
        // We ran out of states and we still hadn't processed the word or validated it in another branch       
        alertify.log("The word is invalid");
      }
      return; // Stop the step
    }

    if (this.currentElement.type == "state") {
      let stateTraversalElement = this.currentElement as TraversalState,
        state = stateTraversalElement.state,
        inputSymbolArray = this.getTransitionSymbol(stateTraversalElement.depth),
        inputSymbol = inputSymbolArray[0],
        inputDelta = inputSymbolArray[1];

      this.automaton.activeElement = state;
      this.lastDepth = stateTraversalElement.depth;

      if (inputSymbol == null) { // We reached the end of the word
        if (state.type == "final" || state.type == "ambivalent") {
          alertify.success("The word is valid");
          this.reachedValidity = true; // If this is a final state, we win!
        } else if (this.traversalStack.length == 0 && !this.reachedValidity) {
          alertify.log("The word is invalid"); // Else, if there is nothing more in the stack we lose.
        }
      } else { // If we still have a word, get ready to branch
        for (let i = state.transitions.length - 1; i >= 0; i--) {
          let transition = state.transitions[i]; // For every transition that matches our condition, push it to the stack
          if (transition.conditions.length == 0
            || transition.hasCondition(inputSymbol)) {
            if (transition.conditions.length == 0) { // Kleene Closures should not consume the string
              this.traversalStack.push(new TraversalTransition(
                stateTraversalElement.depth, "transition", transition));
            } else {
              this.traversalStack.push(new TraversalTransition(
                stateTraversalElement.depth + inputDelta, "transition", transition));
            }
          }
        }
      }
    } else { // If this is a transition, just mark it as active for the front end and push the state to the next stack
      let transitionTraversalElement = this.currentElement as TraversalTransition,
        transition = transitionTraversalElement.transition,
        destinationState = transition.destination;

      this.automaton.activeElement = transition;

      this.traversalStack.push(new TraversalState(
        transitionTraversalElement.depth, "state", destinationState));
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
