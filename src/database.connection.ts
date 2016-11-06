import {HasMany} from './interface/has_many.interface';
import {BaseModel} from './base_model';
import {Inject, Injector} from "@angular/core";
import {Observable} from 'rxjs/Rx';
import {inject} from './helpers/inject';
import {ModelService, Relation} from './model.service';
import {ModelServiceRef} from "./tokens";
import {HasOne} from './interface/has_one.interface';

export abstract class DatabaseConnection<T extends BaseModel<T>> {

  protected type: string;

  abstract get(key:string):T;

  abstract newObservable(model: T): Observable<T>;

  abstract processSourceObject(model: T, source:any);

  /**
   * @param model Parent model
   * @param related Related model service
   * @param other_key The key referencing this model on the related object
   * @param local_index An optional local index for drivers that don't support an automated index
   */
  abstract hasMany<R extends BaseModel<R>>(
    model: BaseModel<T>,
    related: DatabaseConnection<R>,
    other_key: string,
    local_index?: string): HasMany<R>;

  abstract hasOne<R extends BaseModel<R>>(model: BaseModel<T>, relation: Relation, set_related?: BaseModel<any>): HasOne<R>;

  abstract updateOrCreate(obj:{}, key?:any): Observable<T>;

  abstract key(model: T): any;

  abstract delete(entity: T | string);

  constructor(protected injector:Injector, @Inject(ModelServiceRef) protected ms: ModelService) {

  }

  public setType(t: string) {
    this.type = t;
    return this;
  }

  public newInstance():T {
    return inject(this.ms.getClass(this.type), this.injector, [this.type]);
  }
}
