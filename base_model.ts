import {Observable} from "rxjs";
import {ModelService} from '.';

export type ModelType<T extends BaseModel<T>> = T;

export interface pushableCollection {
  push(new_entry: any);
}

export type ModelObservable<T> = T & Observable<T>;
export type ModelCollectionObservable<T> = Observable<ModelObservable<T>[]> & pushableCollection;

export abstract class BaseModel<T extends BaseModel<T>> {
  abstract path():string;

  protected _ref:Firebase;

  constructor(protected service:ModelService<T>) {

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

  withObservable():T & Observable<T> {
    return this.mergeObject(this, this.observable());
  }

  /**
   * @param related related model service
   * @param other_key The key referencing this model on the related object
   * @param local_index An optional local index for drivers that don't support an automated index
   */
  hasMany<R extends BaseModel<R>>(
    related: ModelService<R>,
    other_key: string,
    local_index?: string): ModelCollectionObservable<R> {
    return this.service.hasMany<R>(this, related, other_key, local_index);
  }
}
