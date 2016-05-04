import {ApplicationRef, Inject, Injectable} from "angular2/core";
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable, FirebaseRef} from 'angularfire2/angularfire2';
import {AFUnwrappedDataSnapshot} from "angularfire2/utils/firebase_list_observable";
import * as utils from "angularfire2/utils/utils";
import {BaseModel} from ".";

export interface RelatedUnwrappedSnapshot<T extends BaseModel<T>> extends AFUnwrappedDataSnapshot {
  $related:T & FirebaseObjectObservable<any>;
}

// TODO return type T models
@Injectable()
export class ModelService<T extends BaseModel<T>> {

  protected Type: { new(service: ModelService<T>): T ;};
  protected _instance: T;

  get Instance(): T {
    if(this._instance === undefined) {
      this._instance = this.newInstance();
    }

    return this._instance;
  }

  constructor(@Inject(FirebaseRef) protected ref:Firebase,
              @Inject(ApplicationRef) private app: ApplicationRef,
              protected af:AngularFire) {

  }

  protected newInstance(): T {
    return this.app.injector.get(this.Type);
  }

  // Using set type because it is not possible to interact with T at runtime.
  setType(type: { new(service: ModelService<T>): T ;}) {
    this.Type = type;
  }

  // Type checking is failing on this even though we can assure this = ModelService<T> and not ModelService

  protected newInstanceWithRef(r: Firebase): T {
    let o = this.newInstance();
    o.setRef(r);
    return o;
  }

  get list_ref() {
    if(!this.Type) {
      throw new Error("Type has not been set for a ModelService!");
    }

    return this.ref.child(`/${this.Instance.path()}`);
  }

  child(path:string): Firebase {
    return this.list_ref.child(path);
  }

  get(key: string): T & FirebaseObjectObservable<any> {
    return this.newInstanceWithRef(
      this.child(key)
    ).withObservable();
  }

  database() {
    return this.af.database;
  }

  list(path) {
    return this.database().list(
      this.child(path)
    );
  }

  object(path) {
    return this.database().object(
      this.child(path)
    );
  }

  updateOrCreate(obj:{}, key?:string):FirebaseWithPromise<void> {
    if (key) {
      let child = this.list_ref.child(key);
      return <FirebaseWithPromise<void>>
        Object.assign(child, child.set(obj));
    }

    return this.list_ref.push(obj);
  }

  listFromRelation(relation:FirebaseListObservable<any[]> | Firebase):FirebaseListObservable<RelatedUnwrappedSnapshot<T>[]> {
    let r:FirebaseListObservable<any[]>;

    if (utils.isFirebaseRef(relation)) {
      r = this.af.database.list(
        <Firebase>relation
      );
    } else {
      r = <FirebaseListObservable<any[]>>relation;
    }

    let cache:{ [key:string]:T & FirebaseObjectObservable<any> } = {};

    return <FirebaseListObservable<RelatedUnwrappedSnapshot<T>[]>>r.map(
      collection => {
        // Used to keep track of currently present keys
        let keys = {};

        let r = collection.map(
          (item:RelatedUnwrappedSnapshot<T>) => {
            // Keep track of currently present keys
            keys[item.$key] = true;
            // retrieve or create, and then cache the object observable
            item.$related = cache[item.$key] = cache[item.$key] || this.get(item.$key);
            return item;
          }
        );

        // Delete all missing keys from the cache
        Object
          .keys(cache)
          .filter(k => !keys[k])
          .forEach(k => delete cache[k]);

        return r;
      }
    );
  }
}
