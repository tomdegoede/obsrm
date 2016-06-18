import {Observable} from "rxjs";
import {ModelService} from '.';
import {DatabaseInterface} from './database.interface';

export type ModelType<T extends BaseModel<T>> = T;

export interface pushableCollection {
  push(new_entry: any);
}

export type ModelObservable<T> = T & Observable<T>;
export type ModelCollectionObservable<T> = Observable<ModelObservable<T>[]> & pushableCollection;

export abstract class BaseModel<T extends BaseModel<T>> {
  protected attributes: {[key:string]:any} = {};
  protected obs: Observable<T>;

  public setAttributes(attributes: {[key:string]:any}) {
    this.attributes = attributes;
    return this;
  }

  public getObservable() {
    return this.obs;
  }

  public setObservable(o: Observable<T>) {
    this.obs = o;
  }

  get a() {
    return this.attributes;
  }

  abstract path():string;

  protected _ref:Firebase;

  get service(): DatabaseInterface<T> {
    return <DatabaseInterface<T>>
              this.ms.model(this.constructor);
  }

  constructor(protected ms:ModelService) {

  }

  key() {
    return this.service.key(this.typed);
  }

  // Not sure why I can't just cast <T>this
  // Since this class is abstract meaning this is always derived this is safe
  get typed(): T {
    return <T><any>this;
  }

  setRef(ref:Firebase):BaseModel<T> {
    this._ref = ref;
    return this;
  }

  get ref() {
    return this._ref;
  }

  observable():Observable<T> {
    return this.service.observable(this.typed);
  }

  child(path:string): Firebase {
    return this._ref.child(path);
  }

  private mergeObject(a, b) {
    // Object.assign breaks getters because it only copies values.
    // let o = Object.assign({}, a, b);

    let o:any = {};
    let p;

    for (let i in a) {
      if (p = Object.getOwnPropertyDescriptor(a, i)) {
        Object.defineProperty(o, i, p);
      }
    }
    for (let i in b) {
      if (p = Object.getOwnPropertyDescriptor(b, i)) {
        Object.defineProperty(o, i, p);
      }
    }

    let ap = Object.getPrototypeOf(a);
    let bp = Object.getPrototypeOf(b);

    if (ap || bp) {
      Object.setPrototypeOf(o, this.mergeObject(ap || {}, bp || {}));
    }

    return o;
  }

  withObservable():ModelObservable<T> {
    return this.mergeObject(this.observable(), this);
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
