import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { State, Transition, Coords } from '../automata';


@Component({
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.css']
})
export class DiagramComponent implements OnInit, OnDestroy {
  constructor(private appStateService: AppStateService) {}
  private lastClickDetails: any = {};
 
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
      x: $event.offsetX,
      y: $event.offsetY,
      button: $event.button,
      ctrl: $event.ctrlKey,
      shift: $event.shiftKey, 
      timestamp: $event.timeStamp
    }

    let activeTool = this.appStateService.getActiveTool();
    console.info("onCanvasMouseDown", $event);

    console.info(activeTool);
    switch(activeTool) {
      case 'newFiniteState':
        break;
      case 'newFiniteTransition':
        break;
      default:
        console.warn("Unrecognized tool:", activeTool);
    }
  }

  onDrag($event) {
    console.info("onDrag", $event);
  }

  preventContextMenu($event: MouseEvent) {
    $event.preventDefault();
    $event.stopPropagation();
    return false;
  }

  onCanvasMouseUp($event) {
    let clickDetails = {
      x: $event.offsetX,
      y: $event.offsetY,
      button: $event.button,
      ctrl: $event.ctrlKey,
      shift: $event.shiftKey, 
      timestamp: $event.timeStamp
    };

    let distance = this.distanceBetweenPoints(
      new Coords(clickDetails.x, clickDetails.y),
      new Coords(this.lastClickDetails.x, this.lastClickDetails.y)
    );

    if(distance < 500) {
      this.processLeftClick(clickDetails);
    }

    console.info("onCanvasMouseUp", $event);


  }

  processLeftClick(clickDetails) {
    let activeTool = this.appStateService.getActiveTool();
    console.info("Got a left click", clickDetails);
  
    switch(activeTool) {
      case 'newFiniteState':
        this.createState({x: clickDetails.x, y: clickDetails.y});
        break;
      case 'newFiniteTransition':
        break;
      default:
        console.warn("Unrecognized tool:", activeTool);
      }
  }

  distanceBetweenPoints(a: Coords, b: Coords) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
  }

}
