import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GrammarComponent } from './grammar.component';

import { UnsavedChangesGuard } from '../unsaved-changes.guard';

const routes: Routes = [
  {
    path: 'grammar',
    canDeactivate: [UnsavedChangesGuard],
    component: GrammarComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GrammarRoutingModule { }
