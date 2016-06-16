import {ApplicationRef, Inject, Injectable} from "@angular/core";
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';
import {Observable} from "rxjs";

import {BaseModel, ModelObservable, ModelCollectionObservable} from "../base_model";
import {ModelService} from "../model.service";
import {FirebaseCollection} from './firebase_collection';

// TODO return type T models
@Injectable()
export class FirebaseModelService<T extends BaseModel<T>> extends ModelService<T> {

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef,
              @Inject(FirebaseRef) protected ref:Firebase,
              protected af:AngularFire) {
    super(app);
  }

  get(key:string):ModelObservable<T> {
    return this.newInstanceWithRef(
      this.child(key)
    ).withObservable();
  }

  observable(model: T): Observable<T> {
    return <Observable<T>>this.database().object(
      model.ref
    ).map(properties => {
      let m = this.newInstance().setRef(model.ref);
      Object.assign(m, properties);
      return m;
    });
  }

  hasMany<R extends BaseModel<R>>(
    model:BaseModel<T>,
    related:ModelService<R>,
    other_key:string,
    local_index?:string):ModelCollectionObservable<R> {

    let cache:{ [key:string]:ModelObservable<T> } = {};

    return new FirebaseCollection<R>(model, related, other_key, local_index);
  }

  key(model: T): any {
    return model.ref.key();
  }

// Type checking is failing on this even though we can assure this = FirebaseModelService<T> and not FirebaseModelService

  protected newInstanceWithRef(r:Firebase):T {
    let o = this.newInstance();
    o.setRef(r);
    return o;
  }

  get list_ref() {
    if (!this.Type) {
      throw new Error("Type has not been set for a FirebaseModelService!");
    }

    return this.ref.child(`/${this.Instance.path()}`);
  }

  child(path:string):Firebase {
    return this.list_ref.child(path);
  }

  database() {
    return this.af.database;
  }

  list(path) {
    return this.database().list(
      this.child(path)
    );
  }

  object(path) {
    return this.database().object(
      this.child(path)
    );
  }

  updateOrCreate(obj:{}, key?:string):FirebaseWithPromise<void> {
    if (key) {
      let child = this.list_ref.child(key);
      return <FirebaseWithPromise<void>>
        Object.assign(child, child.set(obj));
    }

    return this.list_ref.push(obj);
  }
}
