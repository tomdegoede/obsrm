import {FirebaseConnection} from './firebase.connection';
import {Observable, Subscriber} from "rxjs";
import {root} from "rxjs/util/root";

export class MultiLocationUpdate extends Observable<any> {
  private data = {};

  constructor(private root: firebase.database.Reference, public resolve_value?) {
    super();
  }

  protected _subscribe(subscriber: Subscriber<any>) {
    this.update().then(
      (value) => {
        if (!subscriber.closed) {
          subscriber.next(this.resolve_value || value);
          subscriber.complete();
        }
      },
      (err) => {
        if (!subscriber.closed) {
          subscriber.error(err);
        }
      }
    ).then(null, err => {
      // escape the promise trap, throw unhandled errors
      root.setTimeout(() => { throw err; });
    });
  }

  add(ref: firebase.database.Reference|MultiLocationUpdate, data?: any) {
    if(ref instanceof MultiLocationUpdate) {
      this.addOther(ref);
    } else {
      this.data[FirebaseConnection.getPath(<firebase.database.Reference>ref)] = data;
    }

    return this;
  }

  private addOther(other: MultiLocationUpdate) {
    for(let i in other.data) {
      if(this.data[i]) {
        console.warn(`Merging ${i} while it already exists.`);
      }

      this.data[i] = other.data[i];
    }

    return this;
  }

  private update(): firebase.Promise<any> {
    return this.root.update(this.data);
  }
}
