import {BaseModel} from '../base_model';
import {ModelCollectionObservable} from "../model_collection.interface";
import {HorizonConnection} from './horizon.connection';
import {Observable} from 'rxjs';

export class HorizonCollection<T extends BaseModel<T>> extends Observable<T[]> implements ModelCollectionObservable<T> {

  protected _cache: {[key:string]:T} = {};

  constructor(protected model: BaseModel<any>, protected related: HorizonConnection<T>, protected other_key: string, protected local_index?: string) {
    super();

    let p:any = {};

    p[other_key] = model.key();

    this.source = related.table().findAll(p).watch()
      .map(collection => this.processCollection(collection));
  }

  protected processCollection(collection) {
    let keys = {};

    // TODO Rewrite filter map to a reduce to reduce loops
    // Only when softdeletes
    collection = collection.filter(item => item);

    let ret = collection.map(
      item => {
        keys[item.id] = true;
        return this._cache[item.id] = this._cache[item.id] || this.related.newInstanceFromObject(item);
      }
    );

    // Delete all missing keys from the cache
    Object
      .keys(this._cache)
      .filter(k => !keys[k])
      .forEach(k => delete this._cache[k]);

    return ret;
  }


  push(new_entry: any) {
    if(this.other_key) {
      new_entry[this.other_key] = this.model.key();
    }

    return this.related.updateOrCreate(
      new_entry
    );
  }

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
}
