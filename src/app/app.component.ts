import { Component, OnInit } from '@angular/core';
import { AppStateService } from './app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  constructor(public appStateService: AppStateService) { }

  ngOnInit() {
    this.appStateService.registerAppComponent(this);
  }
}
