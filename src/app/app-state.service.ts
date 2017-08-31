import { Injectable } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { GlobalState, Metadata } from './global-state';
import { Automata } from './automata';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar.component';

@Injectable()
export class AppStateService {
    private appComponent: AppComponent;
    private toolbarComponent: ToolbarComponent;
    globalState: GlobalState;

    constructor(private location: PlatformLocation) {
        console.info("Created App State Service");
        
        this.location.onPopState(() => {
            let location = window.location.href;
            if(location.split("/").pop() == "home") {
                this.resetState();
            }
         }); 
    }   

    registerAppComponent(app: AppComponent) {
        this.appComponent = app;
    }

    registerToolbarComponent(toolbar: ToolbarComponent) {
        this.toolbarComponent = toolbar;
    }

    startNewProject(type: string) {
        this.globalState = new GlobalState(type);
        console.info("Created new global state:", this.globalState);
    }

    resetState() {
        this.globalState = undefined;
    }

    requestToolbar(toolbarName: string) {
        this.toolbarComponent.activateToolbar(toolbarName);
    }

    releaseToolbar() {
        this.toolbarComponent.activateToolbar(null);
    }

    getActiveTool() {
        return this.toolbarComponent.getSelectedTool();
    }

}