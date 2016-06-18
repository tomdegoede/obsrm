import {BaseModel, ModelCollectionObservable, ModelObservable} from './base_model';
import {Inject, ApplicationRef} from "@angular/core";
import {Observable} from 'rxjs/Rx';

export abstract class DatabaseInterface<T extends BaseModel<T>> {

  protected type;

  abstract get(key:string):ModelObservable<T>;

  protected abstract newObservable(model: T): Observable<T>;

  observable(model: T): Observable<T> {
    if(!model.getObservable()) {
      model.setObservable(this.newObservable(model));
    }

    return model.getObservable();
  }

  /**
   * @param model Parent model
   * @param related Related model service
   * @param other_key The key referencing this model on the related object
   * @param local_index An optional local index for drivers that don't support an automated index
   */
  abstract hasMany<R extends BaseModel<R>>(
    model: BaseModel<T>,
    related: DatabaseInterface<R>,
    other_key: string,
    local_index?: string): ModelCollectionObservable<R>;

  abstract updateOrCreate(obj:{}, key?:any);

  abstract key(model: T): any;

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef) {

  }

  public setType(t) {
    this.type = t;
  }

  public newInstance():T {
    return this.app.injector.get(this.type);
  }
}
