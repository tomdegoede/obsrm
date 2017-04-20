import {Observable} from 'rxjs/Observable';
import {Operator} from 'rxjs/Operator';
import {FirebaseListFactory, FirebaseListObservable} from 'angularfire2';
import {BaseModel} from '../base_model';
import {HasMany} from "../interface/has_many.interface";
import {DatabaseConnection} from '../database.connection';
import {FirebaseConnection} from './firebase.connection';
import {MultiLocationUpdate} from './multi_location_update';
import {isString} from '../lang';

export class FirebaseCollection<T extends BaseModel<T>> extends FirebaseListObservable<T[]> implements HasMany<T> {
  // Cant use _ref because super is using it. Super should declare it protected.
  protected __ref: firebase.database.Reference;
  protected __query: firebase.database.Reference|firebase.database.Query;
  protected _cache: {[key:string]:T} = {};

  protected value: T[] = [];

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

  createChild(source: Observable<T[]>): HasMany<T> {
    let child = new FirebaseCollection(this.model, this.related, this.other_key, this.local_index);
    child.source = source.map(v => child.value = v);
    return child;
  }

  splice(index, howmany, ...items: T[]) {
    index = Math.min(this.value.length, index);

    let prev = this.value[index - 1];
    let next = this.value[index + howmany];
    let r = this.value.splice(index, howmany, ...items);

    // TODO join this with upd below when firebase handles it as a singleton.
    // Currently it emits multiple list updates for the collection in a unexpected order. The unlink HAS to be first

    this.unlink(
      r.map(v => v.key())
    ).subscribe();

    let upd = new MultiLocationUpdate(this.__ref.root);

    // TODO join updates & unlink into single multi loc update
    // Reverse items so we can easily point to their next item (which is cur)
    items.filter(v => v).reverse().forEach(item => {
      upd.add(
        this.link([item.key()], next ? next.key() : true)
      );
      next = item;
    });

    // Link previous item to last inserted (which is first in items)
    if(prev) {
      upd.add(
        this.link([prev.key()], next ? next.key() : true)
      );
    }

    upd.subscribe();

    return r;
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

  private sortLinkedList(collection) {
    let k = collection.map(item => item.$key);

    collection.forEach(item => {
      let i = k.indexOf(item.$value);

      if(i > -1) {
        item.next = collection[i];
        collection[i].prev = item;
      }
    });

    let final = [];

    let current = collection.find(item => !item.prev);

    while(current && !current.visited) {
      final.push(current);
      current.visited = true;
      current = current.next;
    }

    return final.concat(...collection.filter(item => !item.visited));
  }

  protected processCollection(collection) {
    let keys = {};

    // TODO Rewrite filter map to a reduce to reduce loops
    // Only when softdeletes
    collection = collection.filter(item => {
      return item.$value;
    });

    collection = this.sortLinkedList(collection);

    this.value = collection.map(
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

    return this.value;
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

  updateOrPush(val: any, key?, next_key?: string): Promise<T> {
    let upd = new MultiLocationUpdate(this.__ref.root);
    let related: FirebaseConnection<T> = <FirebaseConnection<T>>this.related;

    // Pushing undefined will not require rollback but will create a key
    let ref = key ? this.__ref.child(key) : super.push(undefined);
    let related_ref = related.list_ref.child(ref.key).child('p');

    // Add val to properties
    upd.add(related_ref, val);

    upd.add(
      this.link([ref.key], next_key || true)
    );

    let instance = this.related.newInstance();
    instance.setSource(related_ref.parent);
    instance.setProperties(val);

    // Set the reverse relation so we can call computedRelations on it
    if(this.other_key) {
      instance.setRelation(this.other_key, this.model);
    }

    return this.computedRelationsStatement(instance)
      .map(computed => {
        if(computed instanceof MultiLocationUpdate) {
          upd.add(computed);
        } else if(computed instanceof Observable) {
          return Observable.combineLatest(upd, computed);
        }

        return upd;
      })
      .switch()
      .toPromise()
      .then(v => instance); // Always return the instance
  }

  computedRelationsStatement(instance: BaseModel<any>): Observable<MultiLocationUpdate|Observable<any>> {
    let computed = instance.computedRelations();

    let keys = [];
    let observables: Observable<BaseModel<any>>[] = [];

    for(let i in computed) {
      keys.push(i);
      observables.push(computed[i]);
    }

    if(!keys.length) {
      return Observable.from([null]);
    }

    return Observable.combineLatest(...observables)
      .map((v: BaseModel<any>[]) => {
        let upd = new MultiLocationUpdate(this.__ref.root);
        let non_firebase_statements = [];

        keys.forEach((key, i) => {
          // Return if there's nothing to link
          if(!v[i]) {
            return;
          }

          let link_statement = instance.getRelation(key).link(
            v[i].key()
          );

          if(link_statement instanceof MultiLocationUpdate) {
            upd.add(link_statement);
          } else {
            non_firebase_statements.push(link_statement);
          }
        });

        // Prefer MultiLocationUpdate return
        if(!non_firebase_statements.length) {
          return upd;
        }

        return Observable.combineLatest(upd, ...non_firebase_statements);
      }).take(1);
  }

  remove(key: string) {
    return this.__ref.child(key).remove();
  }

  private setLink(keys: string|string[], value): MultiLocationUpdate {
    if(isString(keys)) {
      keys = [<string>keys];
    }

    let upd = new MultiLocationUpdate(this.__ref.root);
    let related: FirebaseConnection<T> = <FirebaseConnection<T>>this.related;

    keys.forEach(key => {
      upd.add(this.__ref.child(key), value);

      if(this.other_key) {
        let relation_ref = related
          .child(`${key}/r/${this.other_key}/${this.model.key()}`);

        // No use to maintain order in reverse. Convenient we can cast to bool.
        // TODO change when we update to undefined again. See unlink() method
        upd.add(relation_ref, !!value);
      }
    });

    return upd;
  }

  link(keys: string|string[], value: string|boolean = true): MultiLocationUpdate {
    return this.setLink(keys, value);
  }

  unlink(keys: string|string[]): MultiLocationUpdate {
    // TODO change to null when fixed:
    // http://stackoverflow.com/questions/41604815/firebase-query-not-pushing-data-if-node-is-deleted-then-added-back
    return this.setLink(keys, false);
  }

  all(): Observable<T[]> {
    return this
      .map(collection => {
        if(!collection.length) {
          return Observable.from([[]]);
        }

        return Observable.combineLatest(...collection);
      })
      .switch();
  }

  tail(after_key?: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      let addfn = this.__ref.orderByKey().startAt(
        getCurrentPushIDPrefix()
      ).on("child_added", snapshot => {
        subscriber.next(
          this.related.get(snapshot.key)
        );
      });

      return () => {
        this.__ref.off('child_added', addfn);
      };
    });
  }
}

// source: pushid package
function getCurrentPushIDPrefix() {
  var PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  var now = new Date().getTime();

  var timeStampChars = new Array(8);
  for (var i = 7; i >= 0; i--) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
    // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
    now = Math.floor(now / 64);
  }

  return timeStampChars.join('');
}
