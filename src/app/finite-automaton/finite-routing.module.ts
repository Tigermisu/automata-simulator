import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DiagramComponent }   from './diagram.component';
import { FiniteComponent } from './finite.component';
import { TableComponent } from './table.component';
import { SimulatorComponent } from './simulator.component';
import { OptionsComponent } from './options.component';
import { UnsavedChangesGuard } from './unsaved-changes.guard';

const routes: Routes = [
  { 
    path: 'finite', 
    component: FiniteComponent,
    canDeactivate: [],
    children: [
     {
       path: '',
       redirectTo: 'diagram',
       pathMatch: 'full'
     },
     {
       path: 'diagram',
       component: DiagramComponent,
       children: [
         {
          path: "simulator",
          component: SimulatorComponent
          }
       ]
     },
     {
       path: 'table',
       component: TableComponent
     },
     {
      path: 'options',
      component: OptionsComponent
    }
    ]
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class FiniteRoutingModule {}
