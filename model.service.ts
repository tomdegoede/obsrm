import {BaseModel} from '.';
import {Observable} from "rxjs";
import {Inject, ApplicationRef} from "@angular/core";
import {ModelCollectionObservable, ModelObservable} from '.';

export abstract class ModelService<T extends BaseModel<T>> {

  public Type:{ new(service:ModelService<T>):T ;};
  protected _instance:T;

  abstract get(key:string):ModelObservable<T>;

  abstract observable(model: T): Observable<T>;

  /**
   * @param model Parent model
   * @param related Related model service
   * @param other_key The key referencing this model on the related object
   * @param local_index An optional local index for drivers that don't support an automated index
   */
  abstract hasMany<R extends BaseModel<R>>(
    model: BaseModel<T>,
    related: ModelService<R>,
    other_key: string,
    local_index?: string): ModelCollectionObservable<R>;

  abstract updateOrCreate(obj:{}, key?:any);

  abstract key(model: T): any;

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef) {

  }

  public newInstance():T {
    return this.app.injector.get(this.Type);
  }

  // Using set type because it is not possible to interact with T at runtime.
  setType(type:{ new(service:ModelService<T>):T ;}) {
    this.Type = type;
  }

  get Instance():T {
    if (this._instance === undefined) {
      this._instance = this.newInstance();
    }

    return this._instance;
  }
}
