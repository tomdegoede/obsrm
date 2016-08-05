import {ApplicationRef, Inject, Injectable} from "@angular/core";

import {BaseModel} from "../base_model";
import {DatabaseConnection} from '../database.connection';
import {ModelService} from '../model.service';
import {ModelServiceRef} from "../tokens";
import {Observable, BehaviorSubject} from 'rxjs';
import {ModelCollectionObservable} from '../model_collection.interface';
import {HorizonCollection} from "./horizon_collection";
import {isString} from '@angular/core/src/facade/lang';

@Injectable()
export class HorizonConnection<T extends BaseModel<T>> extends DatabaseConnection<T> {

  constructor(@Inject(ApplicationRef) protected app: ApplicationRef,
              @Inject(ModelServiceRef) protected ms: ModelService, protected horizon) {
    super(app, ms);
  }

  protected _table;

  table() {
    return this._table = this._table || this.horizon(this.type);
  }

  get(key: string): T {
    return this.newInstanceWithRef(
      this.child(key), key
    );
  }

  protected child(key) {
    return this.table().find({
      id: key
    }).watch();
  }

  protected newInstanceWithRef(r, key):T {
    let o = this.newInstance();
    o.setProperties({
      id: key
    });
    o.setSource(r);
    return o;
  }

  // TODO update logic from collection
  // TODO horizon authentication
  // TODO activate routes on login (loading?)
  newInstanceFromObject(obj):T {
    let o = this.newInstance();
    o.setSource(new BehaviorSubject(obj));
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
    return new HorizonCollection(model, <HorizonConnection<R>>related, other_key, local_index);
  }

  updateOrCreate(obj: {id}, key?: any) {
    if(key) {
      obj['id'] = key;
    }

    return this.table().store(obj).subscribe();
  }

  key(model: T): any {
    return model.p['id'];
  }

  delete(entity: string|T) {
    if (isString(entity)) {
      return this.table().remove(entity);
    }

    return this.table().remove((<T>entity).key());
  }
}
