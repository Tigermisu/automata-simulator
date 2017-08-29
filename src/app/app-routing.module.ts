import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent }   from './main-menu.component';
import { FiniteComponent } from './finite-automata/finite.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'finite', component: FiniteComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
