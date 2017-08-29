import { Automata } from './automata';

export class GlobalState {
    metadata: Metadata;
    automata: Automata;

    constructor(type: string) {
        this.metadata = new Metadata("New Project");
        this.automata = new Automata(type);
    }
}

export class Metadata {
    title: string;
    creationDate: Date;
    lastEdit: Date;
    isUnsaved: Boolean;

    constructor(title: string) {
        this.title = title;
        this.creationDate = new Date();
        this.lastEdit = this.creationDate;
        this.isUnsaved = false;
    }
}