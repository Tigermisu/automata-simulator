export class Project {
  type: string;
  activeElement: any;
  incorrectElement: any;
  metadata: Metadata;

  constructor(type: string) {
    this.type = type;
  }
}

export class Metadata {
  title: string;
  creationDate: Date;
  lastEdit: Date;
  isUnsaved: Boolean;

  constructor(title: string) {
    this.title = title;
    this.creationDate = new Date();
    this.lastEdit = this.creationDate;
    this.isUnsaved = false;
  }
}