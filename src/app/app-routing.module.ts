import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainMenuComponent }   from './main-menu.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: "full"},
  { path: 'home', component: MainMenuComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
