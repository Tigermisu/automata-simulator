import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormalGrammar, GrammarType } from './formal-grammar';
import { ProjectComponent } from '../project.component'
import { ToolEvent } from '../toolbar.component';

@Component({
  templateUrl: './grammar.component.html',
  styleUrls: ['./grammar.component.css']
})
export class GrammarComponent extends ProjectComponent implements OnInit, OnDestroy {
  protected project: FormalGrammar

  ngOnInit() {
    super.ngOnInit();
    if (this.appStateService.hasActiveProject) {
      this.project = this.appStateService.project as FormalGrammar;
      if (this.project.type != "formal-grammar") { // This should never happen
        this.router.navigateByUrl("/home", { replaceUrl: true });
      }
    } else {
      this.newProject(new FormalGrammar(GrammarType.RegularGrammar), "New Formal Grammar");
    }
  }

  onToolClicked($event: ToolEvent) {
    switch ($event.target) {
      case "new":
        this.newProject(new FormalGrammar(GrammarType.RegularGrammar), "New Formal Grammar");
        break;
      case "open":
        this.openFile(this.parseGrammarObject);
        break;
      case "save":
        this.saveProject((key, value) => {
          return value;
        });
        break;
      default:
        super.onToolClicked($event);
    }
  }

  parseGrammarObject(rawGrammar: FormalGrammar): FormalGrammar {
    let grammar = new FormalGrammar(rawGrammar.grammarType);
    grammar.metadata = rawGrammar.metadata;

    return grammar;
  }
}
