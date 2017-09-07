import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { GrammarRoutingModule } from './grammar-routing.module';

import { GrammarComponent } from './grammar.component';
@NgModule({
  declarations: [
    GrammarComponent
  ],
  imports: [
    BrowserModule,
    GrammarRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [
    GrammarComponent
  ]
})
export class GrammarModule { }
