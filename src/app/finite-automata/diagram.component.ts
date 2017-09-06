import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { State, Transition, Coords, AlphabetSymbol } from '../automata';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AppStateService } from '../app-state.service';
import { FiniteAutomata } from './finite-automata';
import { Subscription } from 'rxjs/Subscription';
import { ToolEvent } from '../toolbar.component';


@Component({
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef: ElementRef;  
  private lastClickDetails: any = { isMouseDown: false };
  private subscription: Subscription;
  private automata: FiniteAutomata;
  draggedState: State = null;

  @HostListener('document:keyup', ['$event']) onKeyUp($event: KeyboardEvent) {
    let keyCode = $event.code;

    console.log($event);

    if(!($event.ctrlKey || $event.srcElement.localName == "input")) {
      switch(keyCode) {        
        case "Delete":        
          this.deleteSelectedItem();
          break;
        case "KeyT":
          this.appStateService.selectTool("newFiniteTransition");
          break;
        case "KeyS":
          this.appStateService.selectTool("newFiniteState");
          break;
      }
    }

    
  };

  get showContextMenu() {
    if(typeof(this.appStateService.project) != "undefined") {
      return (this.automata.selectedState != null 
                  && this.appStateService.getActiveTool() != "newFiniteTransition")
              || this.automata.selectedTransition != null; 
    }
  }

  get contextMenuType() {
    if(typeof(this.appStateService.project) != "undefined") {
      if(this.automata.selectedState != null) {
        return "state";
      } else if(this.automata.selectedTransition != null) {
        return "transition";
      }
    }
    return null;
  }

  get contextMenuBottom() {
    if(typeof(this.appStateService.project) != "undefined") {
      let bottomOffset = this.canvasRef.nativeElement.offsetHeight + 45;
      if(this.contextMenuType == "state") {
        return bottomOffset - this.automata.selectedState.layoutPosition.y;
      } else if(this.contextMenuType == "transition") {
        return bottomOffset - this.automata.selectedTransition.midPoint.y - 10;
      }
    }
  
  }

  get contextMenuLeft() {
    if(typeof(this.appStateService.project) != "undefined") {
      if(this.contextMenuType == "state") {
        return this.automata.selectedState.layoutPosition.x + 120;
      } else if(this.contextMenuType == "transition") {
        return this.automata.selectedTransition.midPoint.x + 125;
      }
    }    
  }

  constructor(private appStateService: AppStateService,
              private sanitizer: DomSanitizer) {}
 
  ngOnInit() {
    this.automata = this.appStateService.project as FiniteAutomata;
    this.appStateService.requestToolbar('finite-automata');
    this.subscription = this.appStateService.toolbarClickedStream.subscribe(($event) => {
      this.onToolClicked($event);
    });
  }

  ngOnDestroy() {
    this.appStateService.releaseToolbar('finite-automata');
    this.subscription.unsubscribe();
  }

  createState(position) {
    this.automata.createState(position);
  }

  deleteSelectedItem() {
    if(this.automata.selectedState != null) {
      this.automata.deleteState(this.automata.selectedState);
      this.automata.selectedState = null;        
      this.automata.metadata.isUnsaved = true;      
    } else if(this.automata.selectedTransition != null) {
      this.automata.deleteTransition(this.automata.selectedTransition);
      this.automata.selectedTransition = null;        
      this.automata.metadata.isUnsaved = true;
    }
  }

  onToolClicked($event: ToolEvent) {
    switch($event.target) {
      case "delete":
        this.deleteSelectedItem();
        break;
    }
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

    this.automata.selectedState = null;
    this.automata.selectedTransition = null;
  
    switch(activeTool) {
      case 'newFiniteState':
        this.automata.metadata.isUnsaved = true;
        this.createState({x: clickDetails.x - 200, y: clickDetails.y - 88});
        break;
      default:      
          this.automata.selectedState = null;
          this.automata.selectedTransition = null;
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
      this.automata.metadata.isUnsaved = true;      
    } else if(this.lastClickDetails.isMouseDown && $event.buttons == 2) {
      let deltaX = $event.pageX - this.lastClickDetails.x,
        deltaY = $event.pageY - this.lastClickDetails.y;

      this.lastClickDetails.x = $event.pageX;
      this.lastClickDetails.y = $event.pageY;

      this.automata.states.forEach((state) => {
        state.layoutPosition.x += deltaX;
        state.layoutPosition.y += deltaY;
      });
      this.automata.metadata.isUnsaved = true;      
    }
  }

  onTransitionMouseDown($event, transition: Transition) {
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
        this.processStateLeftClick(clickDetails, state);  
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
    }
  }

  processTransitionLeftClick(clickDetails, transition: Transition) {
    this.appStateService.deselectTool();
    this.automata.selectedState = null;
    this.automata.selectedTransition = transition;
  }

  processStateLeftClick(clickDetails, state: State) {
    let activeTool = this.appStateService.getActiveTool();
    
    switch(activeTool) {
      case 'newFiniteTransition':
        if(this.automata.selectedState != null) {
          let transition = this.addTransition(this.automata.selectedState, state);
          this.automata.selectedState = null;    
          this.automata.selectedTransition = transition;         
          this.automata.metadata.isUnsaved = true;          
        } else {
          this.automata.selectedTransition = null;
          this.automata.selectedState = state;
        }
        break;
      default:
          this.automata.selectedTransition = null;
          this.automata.selectedState = state;
      }
  }

  onToggleStateTypeCheckbox(checkboxType: string, event: Event) {
    let currentType = this.automata.selectedState.type;
    if((currentType == "initial" && checkboxType == "initial") 
        || (currentType == "final" && checkboxType == "final")) {
      this.automata.selectedState.setType("normal");
    } else if((currentType == "initial" && checkboxType == "final")
            || (currentType == "final" && checkboxType == "initial")) {
      this.automata.selectedState.setType("ambivalent");
    } else if((currentType == "normal" && checkboxType == "initial")
            || (currentType == "ambivalent" && checkboxType == "final")) {
      this.automata.selectedState.setType("initial");
    } else {
      this.automata.selectedState.setType("final");
    }
    this.automata.metadata.isUnsaved = true;    
  }

  addTransition(from: State, to: State): Transition {        
    this.automata.metadata.isUnsaved = true;
    return from.addTransition(to);
  }

  sanitizeStyle(unsafeStyle: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(unsafeStyle);
  }

  removeConditionFromTransition(condition: AlphabetSymbol) {        
    this.automata.metadata.isUnsaved = true;
    this.automata.selectedTransition.removeCondition(condition);
  }

  addConditionToTransition(conditionInput: string) {
    if(conditionInput.trim() != '') { // Prevent empty symbols
      let symbolArray = conditionInput.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        let symbol = new AlphabetSymbol(stringSymbol.trim());
        if(symbol.symbol != "") {
          this.automata.metadata.isUnsaved = true;          
          this.automata.addConditionToTransition(
                this.automata.selectedTransition, symbol);
        }
      });
    }
  }

}
