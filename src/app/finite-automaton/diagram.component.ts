import { Component, OnInit, OnDestroy, ElementRef, ViewChild, HostListener } from '@angular/core';
import { State, Transition, Coords, AlphabetSymbol } from '../automaton';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AppStateService } from '../app-state.service';
import { FiniteAutomaton } from './finite-automaton';
import { Subscription } from 'rxjs/Subscription';
import { ToolEvent } from '../toolbar.component';


@Component({
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit, OnDestroy {
  @ViewChild('canvas') canvasRef: ElementRef;  
  private lastClickDetails: any = { isMouseDown: false };
  private toolbarSubscription: Subscription;
  private projectSubscription: Subscription;
  
  public automaton: FiniteAutomaton;
  public draggedState: State = null;

  @HostListener('document:keyup', ['$event']) onKeyUp($event: KeyboardEvent) {
    let keyCode = $event.code;

    

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
      return (this.automaton.selectedState != null 
                  && this.appStateService.getActiveTool() != "newFiniteTransition")
              || this.automaton.selectedTransition != null; 
    }
  }

  get contextMenuType() {
    if(typeof(this.appStateService.project) != "undefined") {
      if(this.automaton.selectedState != null) {
        return "state";
      } else if(this.automaton.selectedTransition != null) {
        return "transition";
      }
    }
    return null;
  }

  get contextMenuBottom() {
    if(typeof(this.appStateService.project) != "undefined") {
      let bottomOffset = this.canvasRef.nativeElement.offsetHeight + 45;
      if(this.contextMenuType == "state") {
        return bottomOffset - this.automaton.selectedState.layoutPosition.y;
      } else if(this.contextMenuType == "transition") {
        return bottomOffset - this.automaton.selectedTransition.midPoint.y - 10;
      }
    }
  
  }

  get contextMenuLeft() {
    if(typeof(this.appStateService.project) != "undefined") {
      if(this.contextMenuType == "state") {
        return this.automaton.selectedState.layoutPosition.x + 120;
      } else if(this.contextMenuType == "transition") {
        return this.automaton.selectedTransition.midPoint.x + 125;
      }
    }    
  }

  constructor(public appStateService: AppStateService,
              private sanitizer: DomSanitizer) {}
 
  ngOnInit() {
    this.automaton = this.appStateService.project as FiniteAutomaton;
    this.appStateService.requestToolbar('finite-automaton');
    this.toolbarSubscription = this.appStateService.toolbarClickedStream.subscribe(($event) => {
      this.onToolClicked($event);
    });
    this.projectSubscription = this.appStateService.projectChangedStream.subscribe((newProject) => {
      this.automaton = newProject as FiniteAutomaton;
    });
  }

  ngOnDestroy() {
    this.appStateService.releaseToolbar('finite-automaton');
    this.toolbarSubscription.unsubscribe();
    this.projectSubscription.unsubscribe();
  }

  createState(position) {
    this.automaton.createState(position);
  }

  deleteSelectedItem() {
    if(this.automaton.selectedState != null) {
      this.automaton.deleteState(this.automaton.selectedState);
      this.automaton.selectedState = null;        
      this.automaton.metadata.isUnsaved = true;      
    } else if(this.automaton.selectedTransition != null) {
      this.automaton.deleteTransition(this.automaton.selectedTransition);
      this.automaton.selectedTransition = null;        
      this.automaton.metadata.isUnsaved = true;
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

    this.automaton.selectedState = null;
    this.automaton.selectedTransition = null;
  
    switch(activeTool) {
      case 'newFiniteState':
        this.automaton.metadata.isUnsaved = true;
        this.createState({x: clickDetails.x - 200, y: clickDetails.y - 88});
        break;
      default:      
          this.automaton.selectedState = null;
          this.automaton.selectedTransition = null;
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
      this.automaton.metadata.isUnsaved = true;      
    } else if(this.lastClickDetails.isMouseDown && $event.buttons == 2) {
      let deltaX = $event.pageX - this.lastClickDetails.x,
        deltaY = $event.pageY - this.lastClickDetails.y;

      this.lastClickDetails.x = $event.pageX;
      this.lastClickDetails.y = $event.pageY;

      this.automaton.states.forEach((state) => {
        state.layoutPosition.x += deltaX;
        state.layoutPosition.y += deltaY;
      });
      this.automaton.metadata.isUnsaved = true;      
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
    this.automaton.selectedState = null;
    this.automaton.selectedTransition = transition;
  }

  processStateLeftClick(clickDetails, state: State) {
    let activeTool = this.appStateService.getActiveTool();
    
    switch(activeTool) {
      case 'newFiniteTransition':
        if(this.automaton.selectedState != null) {
          let transition = this.addTransition(this.automaton.selectedState, state);
          this.automaton.selectedState = null;    
          this.automaton.selectedTransition = transition;         
          this.automaton.metadata.isUnsaved = true;          
        } else {
          this.automaton.selectedTransition = null;
          this.automaton.selectedState = state;
        }
        break;
      default:
          this.automaton.selectedTransition = null;
          this.automaton.selectedState = state;
      }
  }

  onToggleStateTypeCheckbox(checkboxType: string, event: Event) {
    let currentType = this.automaton.selectedState.type;
    if((currentType == "initial" && checkboxType == "initial") 
        || (currentType == "final" && checkboxType == "final")) {
      this.automaton.selectedState.setType("normal");
    } else if((currentType == "initial" && checkboxType == "final")
            || (currentType == "final" && checkboxType == "initial")) {
      this.automaton.selectedState.setType("ambivalent");
    } else if((currentType == "normal" && checkboxType == "initial")
            || (currentType == "ambivalent" && checkboxType == "final")) {
      this.automaton.selectedState.setType("initial");
    } else {
      this.automaton.selectedState.setType("final");
    }
    this.automaton.metadata.isUnsaved = true;    
  }

  addTransition(from: State, to: State): Transition {        
    this.automaton.metadata.isUnsaved = true;
    return from.addTransition(to);
  }

  sanitizeStyle(unsafeStyle: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(unsafeStyle);
  }

  removeConditionFromTransition(condition: AlphabetSymbol) {        
    this.automaton.metadata.isUnsaved = true;
    this.automaton.selectedTransition.removeCondition(condition);
  }

  addConditionToTransition(conditionInput: string) {
    if(conditionInput.trim() != '') { // Prevent empty symbols
      let symbolArray = conditionInput.trim().split(',');
      symbolArray.forEach((stringSymbol) => {
        let symbol = new AlphabetSymbol(stringSymbol.trim());
        if(symbol.symbol != "") {
          this.automaton.metadata.isUnsaved = true;          
          this.automaton.addConditionToTransition(
                this.automaton.selectedTransition, symbol);
        }
      });
    }
  }

}
