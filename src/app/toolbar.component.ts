import { Component, OnInit } from '@angular/core';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  private selectedTool: string;
  private toolbarEnableState = {
    "finiteautomata": false
  };

  constructor(private appStateService: AppStateService) {}
  

  ngOnInit(): void {    
    this.appStateService.registerToolbarComponent(this);
  }

  activateToolbar(type: string, enable: boolean) {
    switch(type) {
      case "finite-automata":
        this.toolbarEnableState.finiteautomata = enable;
        break;
    }
  }

  getSelectedTool() {
    return this.selectedTool;
  }

  deleteSelection() {
    /*
    if(this.appStateService.project.selectedState != null) {
      this.appStateService.project.deleteState(
              this.appStateService.project.selectedState);
      this.appStateService.project.selectedState = null;
    } else if(this.appStateService.project.selectedTransition != null) {
      this.appStateService.project.deleteTransition(
              this.appStateService.project.selectedTransition);
      this.appStateService.project.selectedTransition = null;
    }
    */
  }

  saveAutomata() {
    console.log(JSON.stringify(this.appStateService.project));
  }

  deselectTool() {
    this.selectedTool = null;
  }

  selectTool(tool: string) {
    if(this.selectedTool != tool) {
      this.selectedTool = tool;
    } else {
      this.selectedTool = null;
      /*
      this.appStateService.project.selectedTransition = null;
      this.appStateService.project.selectedState = null;
      */
    }
  }
}
