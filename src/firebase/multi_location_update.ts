import {FirebaseConnection} from './firebase.connection';

export class MultiLocationUpdate {
  private data = {};

  constructor(private root: firebase.database.Reference) {

  }

  add(ref: firebase.database.Reference, data: any) {
    this.data[FirebaseConnection.getPath(ref)] = data;
  }

  update(): firebase.Promise<any> {
    return this.root.update(this.data);
  }
}
