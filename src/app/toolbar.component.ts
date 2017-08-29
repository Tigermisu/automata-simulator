import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  style: SafeStyle;
  areGeneralToolsHidden: Boolean;

  constructor(private sanitizer: DomSanitizer,
              private appStateService: AppStateService) {}
  

  ngOnInit(): void {    
    this.appStateService.registerToolbarComponent(this);
    //this.style = this.sanitizer.bypassSecurityTrustStyle('background-color: red; border: 5px solid #000;');
    this.areGeneralToolsHidden = true;
  }

  setToolbarType(type: string) {
    this.areGeneralToolsHidden = false;

    switch(type) {
      case "finite-automata":
        console.log("enabling finite automata tools");
        break;
      default:
        console.warn("Unknown toolbar type");
        this.areGeneralToolsHidden = true;
    }
  }
}
