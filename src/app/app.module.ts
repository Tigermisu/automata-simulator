import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FiniteModule } from './finite-automaton/finite.module';
import { GrammarModule } from './grammar-designer/grammar.module';

import { AppStateService } from './app-state.service';

import { AppComponent } from './app.component';
import { ToolbarComponent } from './toolbar.component';
import { MainMenuComponent } from './main-menu.component';
import { ProjectComponent } from './project.component';

import { UnsavedChangesGuard } from './unsaved-changes.guard';

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    MainMenuComponent,
    ProjectComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FiniteModule,
    GrammarModule
  ],
  providers: [
    AppStateService,
    UnsavedChangesGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
