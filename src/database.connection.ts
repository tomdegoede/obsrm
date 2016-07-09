import {ModelCollectionObservable} from './model_collection.interface';
import {BaseModel} from './base_model';
import {Inject, ApplicationRef, OpaqueToken} from "@angular/core";
import {Observable} from 'rxjs/Rx';
import {inject} from './helpers/inject';
import {ModelService, ModelServiceRef} from './model.service';

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
    local_index?: string): ModelCollectionObservable<R>;

  abstract updateOrCreate(obj:{}, key?:any);

  abstract key(model: T): any;

  abstract delete(entity: T | string);

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef, @Inject(ModelServiceRef) protected ms: ModelService) {

  }

  public setType(t: string) {
    this.type = t;
    return this;
  }

  public newInstance():T {
    return inject(this.ms.getClass(this.type), this.app.injector, [this.type]);
  }
}
