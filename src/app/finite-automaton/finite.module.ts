import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FiniteRoutingModule } from './finite-routing.module';

import { FiniteComponent } from './finite.component';
import { DiagramComponent } from './diagram.component';
import { TableComponent } from './table.component';
import { SimulatorComponent } from './simulator.component';
import { OptionsComponent } from './options.component';

import { UnsavedChangesGuard } from './unsaved-changes.guard';

@NgModule({
  declarations: [
    FiniteComponent,
    DiagramComponent,
    TableComponent,
    SimulatorComponent,
    OptionsComponent
  ],
  imports: [
    BrowserModule,
    FiniteRoutingModule,
    FormsModule
  ],
  providers: [
    UnsavedChangesGuard
  ],
  bootstrap: [
    FiniteComponent
  ]
})
export class FiniteModule { }
