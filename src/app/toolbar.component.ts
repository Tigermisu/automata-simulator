import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  style: SafeStyle;
  private selectedTool: string;
  private toolbarEnableState = {
    "finiteautomata": false
  };

  constructor(private sanitizer: DomSanitizer,
              private appStateService: AppStateService) {}
  

  ngOnInit(): void {    
    this.appStateService.registerToolbarComponent(this);
    //this.style = this.sanitizer.bypassSecurityTrustStyle('background-color: red; border: 5px solid #000;');
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

  selectTool(tool: string) {
    this.selectedTool = tool;
  }
}
