import {Injector, Inject, Injectable} from "@angular/core";
import {
  AngularFire, FirebaseRef, FirebaseDatabase, FirebaseListObservable,
  FirebaseObjectObservable
} from 'angularfire2/angularfire2';
import {Observable} from "rxjs";

import {BaseModel} from "../base_model";
import {ModelCollectionObservable} from "../model_collection.interface";
import {FirebaseCollection} from './firebase_collection';
import {DatabaseConnection} from '../database.connection';
import {isString, isArray} from '@angular/core/src/facade/lang';
import {Relation, ModelService} from '../model.service';
import {ModelServiceRef} from "../tokens";

@Injectable()
export class FirebaseConnection<T extends BaseModel<T>> extends DatabaseConnection<T> {

  constructor(protected injector:Injector,
              @Inject(FirebaseRef) protected ref:firebase.app.App,
              protected af:AngularFire, @Inject(ModelServiceRef) protected ms: ModelService) {
    super(injector, ms);
  }

  get(key:string):T {
    return this.newInstanceWithRef(
      this.child(key)
    );
  }

  newObservable(model:T):Observable<T> {
    return this.database().object(
      FirebaseConnection.getRef(model).child('p')
    ).map(properties => {
      return model
        .setProperties(properties);
    });
  }

  processSourceObject(model:T, source:firebase.database.Reference) {
    model.source_object = source;
  }

  hasMany<R extends BaseModel<R>>(model:BaseModel<T>,
                                  related:DatabaseConnection<R>,
                                  other_key:string,
                                  local_index?:string):ModelCollectionObservable<R> {
    return new FirebaseCollection<R>(model, related, other_key, local_index);
  }

  hasOne(model: BaseModel<T>, related: string, call: string) {
    return this.database().object(
      FirebaseConnection.getRef(model).child(`r/${call}`)
    ).map(model => {
      delete model.$key;
      delete model.$value;
      delete model.$exists;

      let keys = Object.keys(model);

      if(!keys.length) {
        return Observable.empty();
      }

      return this.ms.model<any>(related)
        .get(keys[0]);
    }).mergeAll();
  }

  key(model:T):any {
    return FirebaseConnection.getRef(model).key;
  }

  protected disableReverse(model:T, relation:Relation):Observable<any> {
    return model.r[relation.call].take(1).map(r => {
      if(isArray(r)) {
        return r.forEach(
          related => related.r[relation.reverse.call].remove(model.key())
        );
      } else if (r instanceof BaseModel) {
        // TODO implement
        throw "TODO implement disableReverse for Firebase HasOne Relation";
      }
    });
  }

  delete(entity:T | string) {
    if (isString(entity)) {
      entity = this.get(<string>entity);
    }

    let model:T = <T>entity;

    let key = model.key();

    let observables:Observable<any>[] = model.getRelations().map(
      relation => this.disableReverse(model, relation)
    );

    Observable.combineLatest(...observables).subscribe(() => {
      // TODO soft delete
      FirebaseConnection.getRef(model).remove();
    });
  }

  static getRef(model:BaseModel<any>):firebase.database.Reference {
    return model.source_object;
  }

  static getPath(ref: firebase.database.Reference) {
    if(!ref || !ref.key) {
      return;
    }

    let d = [ref.key];
    let p = FirebaseConnection.getPath(ref.parent);

    if(p) {
      d.unshift(p);
    }

    return [p, ref.key].join('/');
  }

  protected newInstanceWithRef(r:firebase.database.Reference):T {
    let o = this.newInstance();
    o.setSource(r);
    return o;
  }

  get list_ref() {
    return this.ref.database().ref().child(`/${this.type}`);
  }

  child(path:string):firebase.database.Reference {
    return this.list_ref.child(path);
  }

  database(): FirebaseDatabase {
    return this.af.database;
  }

  list(path):FirebaseListObservable<any> {
    return this.database().list(
      this.child(path)
    );
  }

  object(path):FirebaseObjectObservable<any> {
    return this.database().object(
      this.child(path)
    );
  }

  updateOrCreate(obj:{}, key?:string):firebase.database.ThenableReference {
    if (key) {
      let child = this.child(key).child('p');
      return <firebase.database.ThenableReference>
        Object.assign(child, child.set(obj));
    }

    return this.list_ref.push({
      p: obj
    });
  }
}
