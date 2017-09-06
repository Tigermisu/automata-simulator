import { Automaton } from '../automaton';

export class FiniteAutomaton extends Automaton {
    isDeterministic: boolean;

    constructor(isDeterministic: boolean) {
        super("finite-automaton");
        this.isDeterministic = isDeterministic;
    }
}