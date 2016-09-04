import {Observable} from 'rxjs/Rx';

export interface ModelCollectionObservable<T> extends Observable<T[]> {
  push(new_entry: any);
  once(): Promise<T[]>;
  remove(key);
}
