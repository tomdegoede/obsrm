import {Observable} from 'rxjs';
import {BaseModel} from './base_model';

// TODO define return types for push methods

export interface ModelCollectionObservable<T> extends Observable<T[]> {
  push(new_entry: any): Promise<T>;
  updateOrPush(val: any, key?): Promise<T>;
  once(): Promise<T[]>;
  remove(key);
  where(where: {[key:string]:any}): ModelCollectionObservable<T>;
  getFirst(): Promise<T>;
}
