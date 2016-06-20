import {Observable} from 'rxjs/Observable';
import {Operator} from 'rxjs/Operator';
import {FirebaseListFactory, FirebaseListObservable} from "angularfire2";
import {BaseModel, pushableCollection, ModelService} from '..';
import {DatabaseInterface} from '../database.interface';
import {FirebaseInterface} from './firebase.interface';

export class FirebaseCollection<T extends BaseModel<T>> extends FirebaseListObservable<T[]> implements pushableCollection {
  // Cant use _ref because super is using it. Super should declare it protected.
  protected __ref: Firebase;

  // TODO typings
  constructor(
    protected model:BaseModel<any>,
    protected related:DatabaseInterface<T>,
    protected other_key:string,
    protected local_index?:string
  ) {
    super(FirebaseInterface.getRef(model).child(local_index));
    this.__ref = FirebaseInterface.getRef(model).child(local_index);

    let cache:{ [key:string]:T } = {};

    this.source = FirebaseListFactory(this.__ref)
      .map(collection => {
        // Used to keep track of currently present keys
        let keys = {};

        // TODO Rewrite filter map to a reduce to reduce loops
        // Only when softdeletes
        collection = collection.filter(item => {
          return item.$value;
        });

        let ret = collection.map(
          item => {
            keys[item.$key] = true;
            return cache[item.$key] = cache[item.$key] || related.get(item.$key);
          }
        );

        // Delete all missing keys from the cache
        Object
          .keys(cache)
          .filter(k => !keys[k])
          .forEach(k => delete cache[k]);

        return ret;
      });
  }

  lift<R>(operator: Operator<T, R>): Observable<R> {
    const observable = <any>new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  push(val: any): FirebaseWithPromise<void> {
    if(this.other_key) {
      if(val[this.other_key] === undefined) {
        val[this.other_key] = {};
      }
      val[this.other_key][this.model.key()] = true;
    }

    let ref = super.push(true);

    this.related.updateOrCreate(
      val, ref.key()
    );

    return ref;
  }
}
