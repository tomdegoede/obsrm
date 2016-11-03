import {Observable} from "rxjs";
import {Has} from './has.interface';

export interface HasOne<T> extends Has<T> {
  link(key: string): Observable<any>;
}
