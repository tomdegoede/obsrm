import {Observable} from "rxjs";
import {ModelService} from '.';
import {DatabaseInterface} from './database.interface';

export interface pushableCollection {
  push(new_entry: any);
}

export type ModelCollectionObservable<T> = Observable<T[]> & pushableCollection;

export abstract class BaseModel<T extends BaseModel<T>> extends Observable<T | any> {

  protected properties: {[key:string]:any} = {};
  source_object: any;

  public setProperties(properties: {[key:string]:any}) {
    this.properties = properties;
    return this;
  }

  get p() {
    return this.properties;
  }

  abstract path():string;

  get service(): DatabaseInterface<T> {
    return <DatabaseInterface<T>>
      this.ms.model(this.constructor);
  }

  constructor(protected ms:ModelService) {
    super();
  }

  key() {
    return this.service.key(this.typed);
  }

  // Not sure why I can't just cast <T>this
  // Since this class is abstract meaning this is always derived this is safe
  get typed(): T {
    return <T><any>this;
  }

  setSource(source): T {
    this.service.processSourceObject(this.typed, source);
    this.source = this.service.newObservable(this.typed);
    return this.typed;
  }

  /**
   * @param related related model service
   * @param other_key The key referencing this model on the related object
   * @param local_index An optional local index for drivers that don't support an automated index
   */
  hasMany<R extends BaseModel<R>>(
    related: DatabaseInterface<R>,
    other_key: string,
    local_index?: string): ModelCollectionObservable<R> {
    return this.service.hasMany<R>(this, related, other_key, local_index);
  }
}
