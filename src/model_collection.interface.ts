import {Observable} from 'rxjs/Rx';

// TODO define return types for push methods

export interface ModelCollectionObservable<T> extends Observable<T[]> {
  push(new_entry: any);
  updateOrPush(val: any, key?);
  once(): Promise<T[]>;
  remove(key);
  where(where: {[key:string]:any}): ModelCollectionObservable<T>;
  getFirst(): Promise<T>;
}
