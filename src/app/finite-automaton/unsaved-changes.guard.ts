import { Injectable, Inject } from '@angular/core';
import { FiniteComponent } from './finite.component';
import { CanDeactivate } from '@angular/router';

@Injectable()
export class UnsavedChangesGuard implements CanDeactivate<FiniteComponent> {
    
    canDeactivate(target: FiniteComponent) {
        if (target.automaton.metadata.isUnsaved) {
            return window.confirm('You have unsaved changes. Are you sure you want to quit?');
        }
        return true;
    }

}