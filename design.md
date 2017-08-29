# Design
This _.md_ details the general design of the application.

## Global Application State
The **Global Application State** stores information about the current editor state, the app entities and includes the automata state. Ideally, an app could at any time read any **Global Application State** and update itself accordingly.

### Components
#### Metadata
The metadata refers to the current document's name, creation date, author and last edit date. It also has information about the current session, including if the current Automata has unsaved modifications.
##### Context
The **context** refers to the active section, which defines the items in the contextual toolbar and elements present in the canvas. Depending on the active context, some sections might not be shown. The following context options are defined:
 - Diagram: Displays the editable graph of the Automata.
 - Transition Table: Displays a formal table detailing the Automata's transitions.
 - Simulation: Displays a non-editable graph with additional entities to simulate the operation of the Automata.
 - Settings: Displays a settings menu that can modify properties about the current Automata.
#### Automata
This part of the **Global Application State** stores the current automata. This is fully defined under **Automata Notation** later in this document.




## Entities
### Menu Item
Menu Items serve as the main navigation inside the app. Clicking on them updates the **Global Application State** with the new context and expands them to reveal sub-options. Suboptions are free of any defined schema and vary greatly according to the entity.

### Toolbar
The toolbar presents itself with options to modify the active Automata.
#### General Options
It contains general options such as undo, redo, save, new automata, open automata and delete automata. These are always present regardless of the current context.
#### Contextual Options
These options appear depending on the global application state's active context and may be different for each of the possibilities. They are direct supporters of the current context.

### Transition Table
The transition table is a table-format display of the current automata. The user can also edit the Automata via adding or removing transitions in the table.

### Diagram
A diagram is an editable graph of the current Automata. 
### State
A state represents an automata's state in the graph. A state is shown visually as a circle with a name inside and may have **transitions** to others or itself.

### Transition
A transition represents a change from one state to another. It is drawn as a simple line, either curved or straight, from one state to another, with a set of symbols denoting the transition condition by its center.

### Stack Visualizer
Reserved for future implementation of push-down automatas.




## Automata Notation