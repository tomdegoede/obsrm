import {Observable} from "rxjs";
import {Has} from './has.interface';
import {BaseModel} from '../base_model';

export interface HasOne<T extends BaseModel<any>> extends Has<T> {
  link(key: string): Observable<any>;
  updateOrCreate(val: {}): Observable<any>;
}
