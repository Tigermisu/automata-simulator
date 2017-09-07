import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GrammarComponent } from './grammar.component';

const routes: Routes = [
  { 
    path: 'grammar', 
    component: GrammarComponent,
  }
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class GrammarRoutingModule {}
