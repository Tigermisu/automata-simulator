import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DiagramComponent }   from './diagram.component';
import { FiniteComponent } from './finite.component';
import { TableComponent } from './table.component';

const routes: Routes = [
  { 
    path: 'finite', 
    component: FiniteComponent,
    children: [
     {
       path: '',
       redirectTo: 'diagram',
       pathMatch: 'full'
     },
     {
       path: 'diagram',
       component: DiagramComponent
     },
     {
       path: 'table',
       component: TableComponent
     }
    ]
  },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class FiniteRoutingModule {}
