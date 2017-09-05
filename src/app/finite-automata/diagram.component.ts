import { Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import { AppStateService } from '../app-state.service';
import { State, Transition, Coords, AlphabetSymbol } from '../automata';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';


@Component({
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef: ElementRef;
  private lastClickDetails: any = { isMouseDown: false };
  draggedState: State = null;
  conditionInput: string;

  get showContextMenu() {
    if(typeof(this.appStateService.globalState) != "undefined") {
      return (this.appStateService.globalState.automata.selectedState != null 
                  && this.appStateService.getActiveTool() != "newFiniteTransition")
              || this.appStateService.globalState.automata.selectedTransition != null; 
    }
  }

  get contextMenuType() {
    if(typeof(this.appStateService.globalState) != "undefined") {
      if(this.appStateService.globalState.automata.selectedState != null) {
        return "state";
      } else if(this.appStateService.globalState.automata.selectedTransition != null) {
        return "transition";
      }
    }
    return null;
  }

  get contextMenuBottom() {
    if(typeof(this.appStateService.globalState) != "undefined") {
      let bottomOffset = this.canvasRef.nativeElement.offsetHeight + 45;
      if(this.contextMenuType == "state") {
        return bottomOffset - this.appStateService.globalState.automata.selectedState.layoutPosition.y;
      } else if(this.contextMenuType == "transition") {
        return bottomOffset - this.appStateService.globalState.automata.selectedTransition.midPoint.y - 10;
      }
    }
  
  }

  get contextMenuLeft() {
    if(typeof(this.appStateService.globalState) != "undefined") {
      if(this.contextMenuType == "state") {
        return this.appStateService.globalState.automata.selectedState.layoutPosition.x + 120;
      } else if(this.contextMenuType == "transition") {
        return this.appStateService.globalState.automata.selectedTransition.midPoint.x + 125;
      }
    }    
  }

  constructor(private appStateService: AppStateService,
              private sanitizer: DomSanitizer) {}
 
  ngOnInit() {
    this.appStateService.requestToolbar('finite-automata');
  }

  ngOnDestroy() {
    this.appStateService.releaseToolbar('finite-automata');
  }

  createState(position) {
      this.appStateService.globalState.automata.createState(position);
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

      if(clickDetails.button == 0) {
        let distance = new Coords(clickDetails.x, clickDetails.y).squareDistanceTo(
          new Coords(this.lastClickDetails.x, this.lastClickDetails.y)
        );

        if(distance < 64) {
          this.processCanvasLeftClick(clickDetails);
        }
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
          this.appStateService.globalState.automata.selectedState = null;
          this.appStateService.globalState.automata.selectedTransition = null;
      }
  }

  onStateMouseMove($event, state: State) {
    if(this.lastClickDetails.isMouseDown 
        && this.lastClickDetails.target == $event.target
        && (this.lastClickDetails.x != $event.pageX 
            || this.lastClickDetails.y != $event.pageY)) {
      this.draggedState = state;
    }
  }

  onCanvasMouseMove($event: MouseEvent) {
    if(this.draggedState != null) {
      this.draggedState.layoutPosition = new Coords(
        this.draggedState.layoutPosition.x = $event.pageX - 200,
        this.draggedState.layoutPosition.y = $event.pageY - 88
      );
    } else if(this.lastClickDetails.isMouseDown && $event.buttons == 2) {
      let deltaX = $event.pageX - this.lastClickDetails.x,
        deltaY = $event.pageY - this.lastClickDetails.y;

      this.lastClickDetails.x = $event.pageX;
      this.lastClickDetails.y = $event.pageY;

      this.appStateService.globalState.automata.states.forEach((state) => {
        state.layoutPosition.x += deltaX;
        state.layoutPosition.y += deltaY;
      });
    }
  }

  onTransitionMouseDown($event, transition: Transition) {
    console.info("ts mouse down");
    $event.stopPropagation();
    this.lastClickDetails = {
      x: $event.pageX,
      y: $event.pageY,
      button: $event.button,
      ctrl: $event.ctrlKey,
      shift: $event.shiftKey, 
      timestamp: $event.timeStamp,
      target: $event.target,
      isMouseDown: false,
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

        if(clickDetails.button == 0) {
          this.processStateLeftClick(clickDetails, state);
          console.info("Got left click on state", $event);
        } else {
          this.processStateRightClick(clickDetails, state);
        }
      }
    }
  }

  onTransitionMouseUp($event: MouseEvent, transition: Transition) {
    $event.stopPropagation();
    this.draggedState = null;

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
      this.processTransitionLeftClick(clickDetails, transition);
      console.info("Got left click on transition", $event);
    }
  }

  processTransitionLeftClick(clickDetails, transition: Transition) {
    this.appStateService.deselectTool();
    this.appStateService.globalState.automata.selectedTransition = transition;
  }

  processStateLeftClick(clickDetails, state: State) {
    let activeTool = this.appStateService.getActiveTool();
    
    switch(activeTool) {
      case 'newFiniteTransition':
        if(this.appStateService.globalState.automata.selectedState != null) {
          let transition = this.addTransition(this.appStateService.globalState.automata.selectedState, state);
          this.appStateService.globalState.automata.selectedState = null;    
          this.appStateService.globalState.automata.selectedTransition = transition;      
        } else {
          this.appStateService.globalState.automata.selectedTransition = null;
          this.appStateService.globalState.automata.selectedState = state;
        }
        break;
      default:
          this.appStateService.globalState.automata.selectedTransition = null;
          this.appStateService.globalState.automata.selectedState = state;
      }
  }

  processStateRightClick(clickDetails, state: State) {
    
  }

  onToggleStateTypeCheckbox(checkboxType: string, event: Event) {
    let currentType = this.appStateService.globalState.automata.selectedState.type;
    if((currentType == "initial" && checkboxType == "initial") 
        || (currentType == "final" && checkboxType == "final")) {
      this.appStateService.globalState.automata.selectedState.setType("normal");
    } else if((currentType == "initial" && checkboxType == "final")
            || (currentType == "final" && checkboxType == "initial")) {
      this.appStateService.globalState.automata.selectedState.setType("ambivalent");
    } else if((currentType == "normal" && checkboxType == "initial")
            || (currentType == "ambivalent" && checkboxType == "final")) {
      this.appStateService.globalState.automata.selectedState.setType("initial");
    } else {
      this.appStateService.globalState.automata.selectedState.setType("final");
    }
  }

  addTransition(from: State, to: State): Transition {
    return from.addTransition(to);
  }

  sanitizeStyle(unsafeStyle: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(unsafeStyle);
  }

  removeConditionFromTransition(condition: AlphabetSymbol) {
    this.appStateService.globalState.automata.selectedTransition.removeCondition(condition);
  }

  addConditionToTransition() {
    if(this.conditionInput.trim() != '') { // Prevent empty symbols
      let symbolArray = this.conditionInput.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        let symbol = new AlphabetSymbol(stringSymbol.trim());
        if(symbol.symbol != "") {
          this.appStateService.globalState.automata.addConditionToTransition(
                this.appStateService.globalState.automata.selectedTransition, symbol);
        }
      });
    }
    this.conditionInput = "";
  }

}
