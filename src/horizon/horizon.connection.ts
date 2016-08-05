import {ApplicationRef, Inject, Injectable} from "@angular/core";

import {BaseModel} from "../base_model";
import {DatabaseConnection} from '../database.connection';
import {ModelService} from '../model.service';
import {ModelServiceRef} from "../tokens";
import {Observable} from 'rxjs';
import {ModelCollectionObservable} from '../model_collection.interface';

@Injectable()
export class HorizonCnnection<T extends BaseModel<T>> extends DatabaseConnection<T> {

  constructor(@Inject(ApplicationRef) protected app: ApplicationRef,
              @Inject(ModelServiceRef) protected ms: ModelService, protected horizon) {
    super(app, ms);
  }

  protected table() {
    return this.horizon(this.type);
  }

  get(key: string): T {
    return this.newInstanceWithRef(
      this.child(key)
    );
  }

  protected child(key) {
    return this.table().find({
      id: key
    }).fetch();
  }

  protected newInstanceWithRef(r):T {
    let o = this.newInstance();
    o.setSource(r);
    return o;
  }

  processSourceObject(model: T, source: any) {
    model.source_object = source;
  }

  newObservable(model: T): Observable<T> {
    return model.source_object.map(properties => {
      return model
        .setProperties(properties);
    });
  }

  hasMany<R extends BaseModel<R>>(model: BaseModel<T>, related: DatabaseConnection<R>, other_key: string, local_index?: string): ModelCollectionObservable<R> {
    let p:any = {};

    p[other_key] = model.key();

    return this.table().findAll(p).fetch();
  }

  updateOrCreate(obj: {id}, key?: any) {
    if(key) {
      obj['id'] = key;
    }

    return this.table().store([
      obj
    ]);
  }

  key(model: T): any {
    return model.p['id'];
  }

  delete(entity: string|T) {

  }
}
