import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { FormalGrammar, GrammarType } from './formal-grammar';
import { Subscription } from 'rxjs/Subscription';
import { ToolEvent } from '../toolbar.component';
import { Router } from '@angular/router';
import { Metadata } from '../project';

declare var alertify;

@Component({
  templateUrl: './grammar.component.html',
  styleUrls: ['./grammar.component.css']
})
export class GrammarComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  grammar: FormalGrammar;

  constructor(private appStateService: AppStateService,
              private router: Router) {}
    
  
  ngOnInit() {
    if(this.appStateService.hasActiveProject) {
      this.grammar = this.appStateService.project as FormalGrammar;
      if(this.grammar.type != "formal-grammar") { // This should never happen
        this.router.navigateByUrl("/home", { replaceUrl: true });
      }
    } else {
      this.newFormalGrammar();     
    }

    this.subscription = this.appStateService.toolbarClickedStream.subscribe(($event) => {
      this.onToolClicked($event);
    });

    window.addEventListener("beforeunload", ($e) => {
      if(this.grammar.metadata.isUnsaved) {
        let msg = "You have unsaved changes. Are you sure you want to exit?";
        // Most browsers don't accept a custom message nowadays, but it's here just in case.
        $e.returnValue = msg; 
        return msg;
      }
    });
  }

  ngOnDestroy() {
    this.appStateService.closeActiveProject();
    this.subscription.unsubscribe();

    window.removeEventListener("beforeUnload");
  }

  onToolClicked($event: ToolEvent) {
    switch($event.target) {
      case "new":
        this.newFormalGrammar();
        break;
      case "open":
        this.openFile();
        break;
      case "save":
        this.saveGrammar();
        break;
      case "undo":
        this.appStateService.undoAction();
        break;
      case "redo": 
        this.appStateService.redoAction(); 
        break;
    }
  }

  openFile() {
    this.protectAgainstUnsavedChanges(() => {
      let fileInput = document.createElement('input');
      fileInput.style.display='none';
      fileInput.type='file';
      fileInput.setAttribute("accept", ".gmr.json");
      document.body.appendChild(fileInput);  
      fileInput.addEventListener("change", ($event) => {
        if(fileInput.files.length > 0) {
          this.loadGrammar(fileInput.files[0]);
        }
        document.body.removeChild(fileInput);
      })
      fileInput.click();
    });    
  }

  loadGrammar(file: File) {
    let reader = new FileReader();
    reader.onload = ($event: any) => {
      let rawGrammar = JSON.parse($event.target.result)
      this.grammar = this.parseGrammarObject(rawGrammar)
      this.appStateService.openProject(this.grammar);
    }
    reader.readAsText(file);
  }

  parseGrammarObject(rawGrammar: FormalGrammar): FormalGrammar {
    let grammar = new FormalGrammar(rawGrammar.grammarType);
    grammar.metadata = rawGrammar.metadata;

    return grammar;
  }

  newFormalGrammar() {
    this.protectAgainstUnsavedChanges(() => {      
      this.grammar = new FormalGrammar(GrammarType.RegularGrammar);
      this.appStateService.openProject(this.grammar);
      this.grammar.metadata = new Metadata("New Formal Grammar");
    });
  }

  saveGrammar() {
    this.grammar.metadata.isUnsaved = false;

    let element = document.createElement('a'),
      jsonGrammar = JSON.stringify(this.grammar, (key, value) => {
      if(key == 'origin' || key == 'destination') {
        return value.id;
      } else if(["selectedState", "selectedTransition", "activeElement"].includes(key)) {
        return undefined;
      } else {
        return value;
      }
    }, 2);
      
    let blob = new Blob([jsonGrammar], { type: "text/plain"});

    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', this.grammar.metadata.title + ".gmr.json");  
    element.style.display = 'none';
    document.body.appendChild(element);  
    element.click();  
    document.body.removeChild(element);
  }

  protectAgainstUnsavedChanges(acknowledgeFunction: Function) {
    if(typeof this.grammar !== "undefined" && this.grammar.metadata.isUnsaved) {
      let message = "Warning: You have unsaved changes in your grammar. If you continue all changes will be lost.";
      alertify.okBtn("Continue without saving").confirm(message, () => {
          acknowledgeFunction();
      });
    } else {
      acknowledgeFunction();
    }
  }
}
