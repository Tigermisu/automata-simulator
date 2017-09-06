import { Injectable } from '@angular/core';
import { Project, Metadata } from './project';
import { Subject } from 'rxjs/Subject';

import { AppComponent } from './app.component';
import { ToolbarComponent, ToolEvent } from './toolbar.component';

@Injectable()
export class AppStateService {
    private appComponent: AppComponent;
    private toolbarComponent: ToolbarComponent;
    private activeProject: Project;
    private toolbarClickedSource = new Subject<ToolEvent>();
    private toolbarClicked$ = this.toolbarClickedSource.asObservable(); 

    get toolbarClickedStream() {
        return this.toolbarClicked$;
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

    closeActiveProject() {
        this.activeProject = undefined;
        this.toolbarComponent.clearActionStack();
    }

    requestToolbar(toolbarName: string) {
        this.toolbarComponent.activateToolbar(toolbarName, true);
    }

    releaseToolbar(toolbarName: string) {
        this.toolbarComponent.activateToolbar(toolbarName, false);
    }

    getActiveTool() {
        return this.toolbarComponent.activeTool;
    }

    selectTool(toolName: string) {
        this.toolbarComponent.selectTool(toolName);
    }

    deselectTool() {
        this.toolbarComponent.deselectTool();
    }

    announceToolbarClick(toolEvent: ToolEvent) {
        this.toolbarClickedSource.next(toolEvent);
    }

    undoAction() {
        this.toolbarComponent.undoAction();
    }

    redoAction() {
        this.toolbarComponent.redoAction();
    }

}