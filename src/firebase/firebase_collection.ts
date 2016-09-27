import {Observable} from 'rxjs/Observable';
import {Operator} from 'rxjs/Operator';
import {FirebaseListFactory, FirebaseListObservable} from "angularfire2";
import {BaseModel} from '../base_model';
import {ModelCollectionObservable} from "../model_collection.interface";
import {DatabaseConnection} from '../database.connection';
import {FirebaseConnection} from './firebase.connection';

export class FirebaseCollection<T extends BaseModel<T>> extends FirebaseListObservable<T[]> implements ModelCollectionObservable<T> {
  // Cant use _ref because super is using it. Super should declare it protected.
  protected __ref: firebase.database.Reference;
  protected _cache: {[key:string]:T} = {};

  constructor(
    protected model:BaseModel<any>,
    protected related:DatabaseConnection<T>,
    protected other_key:string,
    protected local_index?:string,
    protected wheres: {[key:string]:any} = {}
  ) {
    super(FirebaseConnection.getRef(model).child(local_index));
    this.__ref = FirebaseConnection.getRef(model).child(local_index);

    this.source = FirebaseListFactory(this.__ref)
      .map(collection => this.processCollection(collection));
  }

  // TODO implement
  where(where: {[key:string]:any}): FirebaseCollection<T> {
    return this;
  }

  protected processCollection(collection) {
    let keys = {};

    // TODO Rewrite filter map to a reduce to reduce loops
    // Only when softdeletes
    collection = collection.filter(item => {
      return item.$value;
    });

    let ret = collection.map(
      item => {
        keys[item.$key] = true;
        return this._cache[item.$key] = this._cache[item.$key] || this.related.get(item.$key);
      }
    );

    // Delete all missing keys from the cache
    Object
      .keys(this._cache)
      .filter(k => !keys[k])
      .forEach(k => delete this._cache[k]);

    return ret;
  }

  once(): Promise<T[]> {
    return <Promise<T[]>>this.__ref.once("value").then((snapshot:firebase.database.DataSnapshot) => {
      let val = snapshot.val() || {};
      let items = [];
      for(let key in val) {
        items.push({
          $key: key,
          $value: val[key]
        });
      }

      return this.processCollection(items);
    });
  }

  lift<R>(operator: Operator<T, R>): Observable<R> {
    const observable = <any>new Observable();
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  push(val: any): firebase.database.ThenableReference {
    if(this.other_key) {
      if(val[this.other_key] === undefined) {
        val[this.other_key] = {};
      }
      val[this.other_key][this.model.key()] = true;
    }

    let ref = super.push(true);

    this.related.updateOrCreate(
      val, ref.key
    );

    return ref;
  }

  remove(key: string) {
    return this.__ref.child(key).remove();
  }
}
