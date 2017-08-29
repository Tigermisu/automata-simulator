import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FiniteRoutingModule } from './finite-routing.module';

import { FiniteComponent } from './finite.component';
import { DiagramComponent } from './diagram.component';
import { TableComponent } from './table.component';

@NgModule({
  declarations: [
    FiniteComponent,
    DiagramComponent,
    TableComponent
  ],
  imports: [
    BrowserModule,
    FiniteRoutingModule
  ],
  providers: [],
  bootstrap: [
    FiniteComponent
  ]
})
export class FiniteModule { }
