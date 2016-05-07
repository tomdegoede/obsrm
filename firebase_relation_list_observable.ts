import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import {FirebaseObjectObservable, FirebaseListFactory, FirebaseListObservable} from "angularfire2";
import {BaseModel, ModelService} from '.';
import {AFUnwrappedDataSnapshot} from "angularfire2/utils/firebase_list_observable";

export interface RelatedUnwrappedSnapshot<T extends BaseModel<T>> extends AFUnwrappedDataSnapshot {
  $related:T & FirebaseObjectObservable<any>;
}

export class FirebaseRelationListObservable<T> extends FirebaseListObservable<T> {
  // Cant use _ref because super is using it. Super should declare it protected.
  protected __ref: Firebase;

  // TODO typings
  constructor(protected parent: BaseModel<any>, protected relation_key: string, protected related_model_service: ModelService<any>, protected reverse: string) {
    super(null, parent.child(relation_key));
    this.__ref = parent.child(relation_key);

    let cache:{ [key:string]:T & FirebaseObjectObservable<any> } = {};
    
    this.source = FirebaseListFactory(this.__ref).map(
      collection => {
        // Used to keep track of currently present keys
        let keys = {};

        let ret = collection.map(
          (item:RelatedUnwrappedSnapshot<any>) => {
            // Keep track of currently present keys
            keys[item.$key] = true;
            // retrieve or create, and then cache the object observable

            // TODO assign key to related & resolved related
            item.$related = cache[item.$key] = cache[item.$key] || related_model_service.get(item.$key);
            return item;
          }
        );

        // Delete all missing keys from the cache
        Object
          .keys(cache)
          .filter(k => !keys[k])
          .forEach(k => delete cache[k]);

        return ret;
      }
    );
  }
  
  lift<T, R>(operator: Operator<T, R>): Observable<R> {
    const observable = new FirebaseRelationListObservable<R>(this.parent, this.relation_key, this.related_model_service, this.reverse);
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  push(val: any): FirebaseWithPromise<void> {
    if(this.reverse) {
      if(val[this.reverse] === undefined) {
        val[this.reverse] = {};
      }
      val[this.reverse][this.parent.ref.key()] = true;
    }

    let ref = super.push(true);

    this.related_model_service.updateOrCreate(
      val, ref.key()
    );
    
    return ref;
  }
}
