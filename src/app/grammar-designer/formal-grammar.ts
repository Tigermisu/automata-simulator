import { Project } from '../project';

export class FormalGrammar extends Project {
    grammarType: GrammarType;

    constructor(grammarType: GrammarType) {
        super('formal-grammar')

        this.grammarType = grammarType;
    }
}

export enum GrammarType {
    RegularGrammar
}