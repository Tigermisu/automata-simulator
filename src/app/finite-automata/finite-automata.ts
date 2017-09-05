import { Automata } from '../automata';

export class FiniteAutomata extends Automata {
    isDeterministic: boolean;

    constructor(isDeterministic: boolean) {
        super("finite-automata");
        this.isDeterministic = isDeterministic;
    }
}