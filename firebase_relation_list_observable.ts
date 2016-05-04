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

  constructor(_ref: Firebase, protected related_model_service: ModelService<any>, protected reverse: string) {
    super(null, _ref);
    this.__ref = _ref;

    let cache:{ [key:string]:T & FirebaseObjectObservable<any> } = {};
    
    this.source = FirebaseListFactory(_ref).map(
      collection => {
        // Used to keep track of currently present keys
        let keys = {};

        let ret = collection.map(
          (item:RelatedUnwrappedSnapshot<any>) => {
            // Keep track of currently present keys
            keys[item.$key] = true;
            // retrieve or create, and then cache the object observable
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
    const observable = new FirebaseRelationListObservable<R>(this.__ref, this.related_model_service, this.reverse);
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  push(val: any): FirebaseWithPromise<void> {
    // TODO get a ref to the parent model instead of assuming its the direct parent
    if(this.reverse) {
      if(val[this.reverse] === undefined) {
        val[this.reverse] = {};
      }
      val[this.reverse][this.__ref.parent().key()] = true;
    }

    let ref = super.push(true);

    this.related_model_service.updateOrCreate(
      val, ref.key()
    );
    
    return ref;
  }
}
