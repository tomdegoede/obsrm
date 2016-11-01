import {BaseModel} from '../base_model';
import {ModelCollectionObservable} from "../model_collection.interface";
import {HorizonConnection} from './horizon.connection';
import {Observable} from 'rxjs';

export class HorizonCollection<T extends BaseModel<T>> extends Observable<T[]> implements ModelCollectionObservable<T> {

  protected _cache: {[key:string]:T} = {};
  protected value: T[] = [];

  constructor(protected model: BaseModel<any>, protected related: HorizonConnection<T>, protected other_key: string, protected local_index?: string, protected wheres: {[key:string]:any} = {}) {
    super();

    this.wheres[other_key] = model.key();

    // this.source = related.table().findAll(p).watch({
    //   rawChanges: true
    // })
    //   .map(changes => this.processRawChanges(changes));

    this.source = related.table().findAll(this.wheres).watch()
      .map(collection => this.processCollection(collection)).share();
  }

  where(where: {[key:string]:any}): HorizonCollection<T> {
    let w = this.wheres;

    for(var key in where) {
      w[key] = where[key];
    }

    return new HorizonCollection(this.model, this.related, this.other_key, this.local_index, w);
  }

  getFirst(): Promise<T> {
    let w = Observable.from(
      this.related.table().find(this.wheres).watch()
    );

    return w.map<T>(properties => {
      let i = this.related.newInstance();
      i.setProperties(properties);
      i.setSource(w);

      return i;
    }).take(1).toPromise();
  }

  private _collection = [];

  private processRawChanges(change) {
    console.log(change);

    if (change.new_val != null) {
      delete change.new_val.$hz_v$
    }

    if(change.new_val) {
      console.log(this._collection.indexOf(change.new_val));

      this._collection.push(change.new_val);
    } else if(change.old_val) {
      let i = this._collection.indexOf(change.old_val);
      this._collection.splice(i, 1);
    }

    return this.processCollection(this._collection);
  }

  protected processCollection(collection) {
    let keys = {};

    // TODO Rewrite filter map to a reduce to reduce loops
    // Only when softdeletes
    collection = collection.filter(item => item);

    this.value = collection.map(
      item => {
        keys[item.id] = true;
        return this._cache[item.id] = this._cache[item.id] || this.related.newInstanceFromObject(item);
      }
    );

    // console.log(collection, this.value);

    // Delete all missing keys from the cache
    Object
      .keys(this._cache)
      .filter(k => !keys[k])
      .forEach(k => delete this._cache[k]);

    return this.value;
  }

  protected parsePushEntry(new_entry: any) {
    if(new_entry instanceof BaseModel) {
      if(new_entry.p['id']) {
        this._cache[new_entry.p['id']] = <T>new_entry;
      }

      new_entry = new_entry.p;
    }

    if(this.other_key) {
      new_entry[this.other_key] = this.model.key();
    }

    return new_entry;
  }

  push(new_entry: any) {
    new_entry = this.parsePushEntry(new_entry);

    return this.related.updateOrCreate(
      new_entry
    );
  }

  updateOrPush(val: any, key?) {
    if(!key) {
      return this.push(val);
    }

    val = this.parsePushEntry(val);

    return this.related.updateOrCreate(val, key);
  }

  splice(index, howmany, ...items) {
    items.forEach(item => this.push(item));
    return this.value.splice(index, howmany, ...items);
  }

  // TODO implement
  once(): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      resolve([]);
    });
  }

  remove(key: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }

  link(keys: string[]) {

  }
}
