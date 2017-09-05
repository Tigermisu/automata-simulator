import { Injectable } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import { Project, Metadata } from './project';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar.component';

@Injectable()
export class AppStateService {
    private appComponent: AppComponent;
    private toolbarComponent: ToolbarComponent;
    private activeProject: Project;

    constructor(private location: PlatformLocation) {
        this.location.onPopState(() => {
            let location = window.location.href;
            if(location.split("/").pop() == "home") {
                this.resetState();
            }
         }); 
    }

    get hasActiveProject() {
        return typeof this.activeProject !== "undefined";
    }

    get project() {
        return this.activeProject;
    }

    set project(projectInstance: Project) {
        this.activeProject = projectInstance;
    }

    registerAppComponent(app: AppComponent) {
        this.appComponent = app;
    }

    registerToolbarComponent(toolbar: ToolbarComponent) {
        this.toolbarComponent = toolbar;
    }

    resetState() {
        this.activeProject = undefined;
    }

    requestToolbar(toolbarName: string) {
        this.toolbarComponent.activateToolbar(toolbarName, true);
    }

    releaseToolbar(toolbarName: string) {
        this.toolbarComponent.activateToolbar(toolbarName, false);
    }

    getActiveTool() {
        return this.toolbarComponent.getSelectedTool();
    }

    deselectTool() {
        this.toolbarComponent.deselectTool();
    }

}