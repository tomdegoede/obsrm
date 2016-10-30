import {Observable} from 'rxjs/Observable';
import {Operator} from 'rxjs/Operator';
import {FirebaseListFactory, FirebaseListObservable} from 'angularfire2';
import {BaseModel} from '../base_model';
import {ModelCollectionObservable} from "../model_collection.interface";
import {DatabaseConnection} from '../database.connection';
import {FirebaseConnection} from './firebase.connection';
import {MultiLocationUpdate} from './multi_location_update';
import {ThenableReference} from './thenable_reference';

export class FirebaseCollection<T extends BaseModel<T>> extends FirebaseListObservable<T[]> implements ModelCollectionObservable<T> {
  // Cant use _ref because super is using it. Super should declare it protected.
  protected __ref: firebase.database.Reference;
  protected __query: firebase.database.Reference|firebase.database.Query;
  protected _cache: {[key:string]:T} = {};

  constructor(
    protected model:BaseModel<any>,
    protected related:DatabaseConnection<T>,
    protected other_key:string,
    protected local_index?:string,
    protected wheres: {[key:string]:any} = {}
  ) {
    super(FirebaseConnection.getRef(model).child('r').child(local_index));
    this.__ref = this.__query = FirebaseConnection.getRef(model).child('r').child(local_index);

    let has_where;
    for(let key in wheres) {
      if(has_where) {
        console.log('Adding multiple wheres to a firebase query is not possible');
      }
      this.__query = this.__ref.orderByChild(key).equalTo(wheres[key] === undefined ? null : wheres[key]);
    }

    this.source = FirebaseListFactory(this.__query)
      .map(collection => this.processCollection(collection));
  }

  where(where: {[key:string]:any}): FirebaseCollection<T> {
    let w = this.wheres;

    for(let key in where) {
      w[key] = where[key];
    }

    return new FirebaseCollection(this.model, this.related, this.other_key, this.local_index, w);
  }

  getFirst(): Promise<T> {
    let related = this.related;

    return new Promise((resolve, reject) => {
      this.__ref.limitToFirst(1).once('child_added', function (snapshot, prevKey) {
        resolve(
          related.get(snapshot.key)
        );
      });
    });
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

  push(val: any): any /** Needed since return type of parent does not match */ {
    return this.updateOrPush(val);
  }

  updateOrPush(val: any, key?): Promise<T> {
    let upd = new MultiLocationUpdate(this.__ref.root);
    let related: FirebaseConnection<T> = <FirebaseConnection<T>>this.related;

    // Pushing undefined will not require rollback but will create a key
    let ref = key ? this.__ref.child(key) : super.push(undefined);

    let related_ref = related.list_ref.child(ref.key).child('p');

    // Set true for own collection
    upd.add(ref, true);

    // Add val to properties
    upd.add(related_ref, val);

    // Add reverse relation key to new model
    if(this.other_key) {
      let relation_ref = related
        .child(`${ref.key}/r/${this.other_key}/${this.model.key()}`);

      upd.add(relation_ref, true);
    }

    upd.update();

    return new Promise((done) => {
      let instance = this.related.newInstance();
      instance.setSource(related_ref.parent);
      done(instance);
    });
  }

  remove(key: string) {
    return this.__ref.child(key).remove();
  }
}
