import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Project, Metadata } from './project';
import { AppStateService } from './app-state.service';
import { Subscription } from 'rxjs/Subscription';
import { ToolEvent } from './toolbar.component';
import { Router } from '@angular/router';

declare var alertify;

@Component({
  template: "You shouldn't be seeing this."
})
export class ProjectComponent implements OnInit, OnDestroy {
  private onUnloadFunction: EventListener;
  private subscription: Subscription;
  protected project: Project;

  constructor(protected appStateService: AppStateService,
        protected router: Router) {}

  @HostListener('document:keydown', ['$event']) onKeyDown($event: KeyboardEvent) { 
    let keyCode = $event.code;
    
    if($event.ctrlKey) {
      $event.preventDefault();
      $event.stopPropagation();
      switch(keyCode) {
      case "KeyZ":
        this.appStateService.undoAction();
        break;
      case "KeyY":        
        this.appStateService.redoAction();
        break;
      }    
    }
  }
  
  
  ngOnInit() {
    this.subscription = this.appStateService.toolbarClickedStream.subscribe(($event) => {
      this.onToolClicked($event);
    });
    
    this.onUnloadFunction = ($e) => {
      if(this.project.metadata.isUnsaved) {
        // Most browsers don't accept a custom message nowadays, but it's here just in case.
        return "You have unsaved changes. Are you sure you want to exit?";
      }
    }

    alertify.logPosition("top right");    

    window.addEventListener("beforeunload", this.onUnloadFunction);
  }

  ngOnDestroy() {
    this.appStateService.closeActiveProject();
    this.subscription.unsubscribe();

    window.removeEventListener("beforeUnload", this.onUnloadFunction);    
  }

  onToolClicked($event: ToolEvent) {
    switch($event.target) {
      case "undo":
      this.appStateService.undoAction();
      break;
      case "redo": 
      this.appStateService.redoAction(); 
      break;
    }
  }

  openFile(parseFunction: Function) {
    this.protectAgainstUnsavedChanges(() => {
      let fileInput = document.createElement('input');
      fileInput.style.display='none';
      fileInput.type='file';
      fileInput.setAttribute("accept", ".json");
      document.body.appendChild(fileInput);  
      fileInput.addEventListener("change", ($event) => {
      if(fileInput.files.length > 0) {
        this.loadProject(fileInput.files[0], parseFunction);
      }
      document.body.removeChild(fileInput);
      })
      fileInput.click();
    });    
  }

  loadProject(file: File, parseFunction: Function) {
    let reader = new FileReader();
    reader.onload = ($event: any) => {
      try {
        let rawProject = JSON.parse($event.target.result)
        this.project = parseFunction(rawProject)
        this.appStateService.openProject(this.project);
      } catch (e) {
        alertify.error("Invalid Project File");
        console.info("Unable to parse JSON:", e);
      }
    }
    reader.readAsText(file);
  }

  newProject(project: Project, title: string, redirectUrl?: string) {
    this.protectAgainstUnsavedChanges(() => {      
      this.project = project;
      this.appStateService.openProject(this.project);
      this.project.metadata = new Metadata(title);

      if(redirectUrl) {
      this.router.navigateByUrl(redirectUrl, { replaceUrl: true });         
      }
    });
  }

  saveProject(filter: Function) {
    this.project.metadata.isUnsaved = false;

    let element = document.createElement('a'),
      jsonProject = JSON.stringify(this.project, filter as any, 2);
      
    let blob = new Blob([jsonProject], { type: "text/plain"});

    element.setAttribute('href', window.URL.createObjectURL(blob));
    element.setAttribute('download', this.project.metadata.title + ".json");  
    element.style.display = 'none';
    document.body.appendChild(element);  
    element.click();  
    document.body.removeChild(element);
  }

  protectAgainstUnsavedChanges(acknowledgeFunction: Function) {
    if(typeof this.project !== "undefined" && this.project.metadata.isUnsaved) {
      let message = "Warning: You have unsaved changes in your project. If you continue all changes will be lost.";
      alertify.okBtn("Continue without saving").confirm(message, () => {
        acknowledgeFunction();
      });
    } else {
      acknowledgeFunction();
    }
  }
}
