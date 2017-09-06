import { Component, OnInit, EventEmitter, Output } from '@angular/core';
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

  @Output() toolclicked: EventEmitter<ToolEvent> = new EventEmitter();

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

  get activeTool(): string {
    return this.selectedTool;
  }

  deselectTool() {
    this.selectedTool = null;
  }

  onToolClick(toolName: string, isToggleable: boolean) {
    if(isToggleable) {
      this.selectTool(toolName);
    }
    this.toolclicked.emit(new ToolEvent(toolName, isToggleable, this.selectedTool == toolName));
    this.appStateService.announceToolbarClick(new ToolEvent(toolName, isToggleable, this.selectedTool == toolName));
  }

  selectTool(tool: string) {
    if(this.selectedTool != tool) {
      this.selectedTool = tool;
    } else {
      this.deselectTool();
    }
  }
}

export class ToolEvent {
  target: string;
  toggleable: boolean;
  isActive: boolean;

  constructor (target: string, toggleable: boolean, isActive: boolean) {
    this.target = target;
    this.toggleable = toggleable;
    this.isActive = isActive;
  }
}
