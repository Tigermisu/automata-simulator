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

  activateToolbar(type: string) {

    switch(type) {
      case "finite-automata":
        this.toolbarEnableState.finiteautomata = true;
        break;
      default:
        this.toolbarEnableState.finiteautomata = false;
    }
  }

  getSelectedTool() {
    return this.selectedTool;
  }

  deleteSelection() {
    if(this.appStateService.globalState.automata.selectedState != null) {
      this.appStateService.globalState.automata.deleteState(
              this.appStateService.globalState.automata.selectedState);
    } else {

    }
  }

  saveAutomata() {
    console.log(JSON.stringify(this.appStateService.globalState));
  }

  selectTool(tool: string) {
    if(this.selectedTool != tool) {
      this.selectedTool = tool;
    } else {
      this.selectedTool = null;
    }
  }
}
