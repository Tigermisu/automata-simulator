import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'toolbar',
  templateUrl: './toolbar.component.html'
})
export class ToolbarComponent implements OnInit {
  style: SafeStyle;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {    
    this.style = this.sanitizer.bypassSecurityTrustStyle('background-color: red; border: 5px solid #000;');
  }
}
