import { Injectable, Inject } from '@angular/core';
import { ProjectComponent } from './project.component';
import { CanDeactivate } from '@angular/router';

@Injectable()
export class UnsavedChangesGuard implements CanDeactivate<ProjectComponent> {

    canDeactivate(target: ProjectComponent) {
        if (target.project.metadata.isUnsaved) {
            return window.confirm('You have unsaved changes in your project. Are you sure you want to quit?');
        }
        return true;
    }

}