import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { State, Transition, Coords } from '../automata';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';


@Component({
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit, OnDestroy {
  private lastClickDetails: any = {
    isMouseDown: false
  };
  draggedState: State = null;

  constructor(private appStateService: AppStateService,
              private sanitizer: DomSanitizer) {}
 
  ngOnInit() {
    this.appStateService.requestToolbar('finite-automata');
  }

  ngOnDestroy() {
    this.appStateService.releaseToolbar();
  }

  createState(position) {
    let stateNumber = this.appStateService.globalState.automata.states.length,
      state = new State("q" + stateNumber, "normal", new Coords(position.x, position.y));
      
      if(stateNumber == 0) state.type = "initial";

      this.appStateService.globalState.automata.states.push(state);
    }

  onCanvasMouseDown($event: MouseEvent) {
    this.lastClickDetails = {
      x: $event.pageX,
      y: $event.pageY,
      button: $event.button,
      ctrl: $event.ctrlKey,
      shift: $event.shiftKey, 
      timestamp: $event.timeStamp,
      target: $event.target,
      isMouseDown: true,
    }
  }

  preventContextMenu($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    return false;
  }

  onCanvasMouseUp($event: MouseEvent) {
    this.draggedState = null;
    
    if(this.lastClickDetails.isMouseDown) {
      this.lastClickDetails.isMouseDown = false;

      let clickDetails = {
        x: $event.pageX,
        y: $event.pageY,
        button: $event.button,
        ctrl: $event.ctrlKey,
        shift: $event.shiftKey, 
        timestamp: $event.timeStamp,
        target: $event.target
      };

      let distance = new Coords(clickDetails.x, clickDetails.y).squareDistanceTo(
        new Coords(this.lastClickDetails.x, this.lastClickDetails.y)
      );

      if(distance < 64) {
        this.processCanvasLeftClick(clickDetails);
      }
    }
  }

  processCanvasLeftClick(clickDetails) {
    let activeTool = this.appStateService.getActiveTool();
    console.info("Got a left click on the canvas", clickDetails);

    this.appStateService.globalState.automata.selectedState = null;
  
    switch(activeTool) {
      case 'newFiniteState':
        this.createState({x: clickDetails.x - 200, y: clickDetails.y - 88});
        break;
      default:
        console.warn("Unrecognized tool:", activeTool);
      }
  }

  onStateMouseMove($event, state: State) {
    if(this.lastClickDetails.isMouseDown && this.lastClickDetails.target == $event.target) {
      this.draggedState = state;
    }
  }

  onCanvasMouseMove($event) {
    if(this.draggedState != null) {
      this.draggedState.layoutPosition = new Coords(
        this.draggedState.layoutPosition.x = $event.pageX - 200,
        this.draggedState.layoutPosition.y = $event.pageY - 88
      );
    }
  }

  onStateMouseUp($event: MouseEvent, state: State) {
    $event.stopPropagation();
    this.draggedState = null;

    if(this.lastClickDetails.isMouseDown) {
      this.lastClickDetails.isMouseDown = false;

      let clickDetails = {
        x: $event.pageX,
        y: $event.pageY,
        button: $event.button,
        ctrl: $event.ctrlKey,
        shift: $event.shiftKey, 
        timestamp: $event.timeStamp,
        target: $event.target
      };

      let distance = new Coords(clickDetails.x, clickDetails.y).squareDistanceTo(
        new Coords(this.lastClickDetails.x, this.lastClickDetails.y)
      );

      if(distance < 64) {
        this.processStateLeftClick(clickDetails, state);
        console.info("Got left click on state", $event);
      }
    }
  }

  processStateLeftClick(clickDetails, state: State) {
    let activeTool = this.appStateService.getActiveTool();
    
    switch(activeTool) {
      case 'newFiniteTransition':
        if(this.appStateService.globalState.automata.selectedState != null) {
          this.addTransition(this.appStateService.globalState.automata.selectedState, state);
          this.appStateService.globalState.automata.selectedState = null;
          break;
        }
      default:
        this.appStateService.globalState.automata.selectedState = state;
      }
  }

  addTransition(from: State, to: State) {
    from.addTransition(to);
  }

  sanitizeStyle(unsafeStyle: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(unsafeStyle);
  }

}
