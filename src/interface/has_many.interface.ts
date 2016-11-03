import {Observable} from 'rxjs';
import {Has} from './has.interface';

// TODO define return types for push methods

export interface HasMany<T> extends Has<T[]> {
  push(new_entry: any): Promise<T>;
  updateOrPush(val: any, key?): Promise<T>;
  once(): Promise<T[]>;
  remove(key);
  where(where: {[key:string]:any}): HasMany<T>;
  getFirst(): Promise<T>;
  link(keys: string|string[]): Observable<any>;
}
