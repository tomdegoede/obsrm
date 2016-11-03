import {Observable} from "rxjs";

export interface Has<T> extends Observable<T> {
  link(key: string);
}
