import {ApplicationRef, Inject, Injectable} from "@angular/core";
import {
  AngularFire, FirebaseRef, FirebaseDatabase, FirebaseListObservable,
  FirebaseObjectObservable
} from 'angularfire2/angularfire2';
import {Observable} from "rxjs";

import {BaseModel} from "../base_model";
import {ModelCollectionObservable} from "../model_collection.interface";
import {FirebaseCollection} from './firebase_collection';
import {DatabaseConnection} from '../database.connection';
import {isString} from '@angular/core/src/facade/lang';
import {Relation, ModelService, ModelServiceRef} from '../model.service';

@Injectable()
export class FirebaseConnection<T extends BaseModel<T>> extends DatabaseConnection<T> {

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef,
              @Inject(FirebaseRef) protected ref:firebase.app.App,
              protected af:AngularFire, @Inject(ModelServiceRef) protected ms: ModelService) {
    super(app, ms);
  }

  get(key:string):T {
    return this.newInstanceWithRef(
      this.child(key)
    );
  }

  newObservable(model:T):Observable<T> {
    return this.database().object(
      FirebaseConnection.getRef(model)
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

  key(model:T):any {
    return FirebaseConnection.getRef(model).key;
  }

  protected disableReverse(model:T, relation:Relation):Promise<any> {
    let promise = model.r[relation.call].once();

    promise.then((collection:BaseModel<any>[]) => {
      return collection.forEach(
        related => related.r[relation.reverse.call].remove(model.key())
      );
    });

    return promise;
  }

  delete(entity:T | string) {
    if (isString(entity)) {
      entity = this.get(<string>entity);
    }

    let model:T = <T>entity;

    let key = model.key();

    let promises:Promise<any>[] = model.getRelations().map<Promise<any>>(
      relation => this.disableReverse(model, relation)
    );

    return Promise.all(promises).then(
      // TODO soft delete
      () => FirebaseConnection.getRef(model).remove()
    );
  }

  static getRef(model:BaseModel<any>):firebase.database.Reference {
    return model.source_object;
  }

  protected newInstanceWithRef(r:firebase.database.Reference):T {
    let o = this.newInstance();
    o.setSource(r);
    return o;
  }

  get list_ref() {
    return this.ref.database().ref().child(`/${this.newInstance().path()}`);
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
      let child = this.list_ref.child(key);
      return <firebase.database.ThenableReference>
        Object.assign(child, child.set(obj));
    }

    return this.list_ref.push(obj);
  }
}
