import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FiniteModule } from './finite-automata/finite.module';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar.component';
import { MainMenuComponent }   from './main-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    MainMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FiniteModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
