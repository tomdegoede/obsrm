import {Injector, Inject, Injectable} from "@angular/core";
import {
  AngularFire, FirebaseRef, FirebaseDatabase, FirebaseListObservable, FirebaseObjectObservable
} from 'angularfire2';
import {Observable} from "rxjs";

import {BaseModel} from "../base_model";
import {HasMany} from "../interface/has_many.interface";
import {FirebaseCollection} from './firebase_collection';
import {DatabaseConnection} from '../database.connection';
import {isString, isArray} from "../lang";
import {ModelService, Relation} from '../model.service';
import {ModelServiceRef} from "../tokens";
import {MultiLocationUpdate} from './multi_location_update';
import {ThenableReference} from './thenable_reference';
import {HasOne} from '../interface/has_one.interface';
import {FirebaseHasOne} from './has_one';

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

  private static processProperties(properties) {
    delete properties.$key;
    delete properties.$value;
    delete properties.$exists;

    return properties;
  }

  newObservable(model:T):Observable<T> {
    return this.database().object(
      FirebaseConnection.getRef(model).child('p')
    ).map(properties => {
      properties = FirebaseConnection.processProperties(properties);

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
                                  local_index?:string):HasMany<R> {
    return new FirebaseCollection<R>(model, related, other_key, local_index);
  }

  hasOne<R extends BaseModel<any>>(model: BaseModel<T>, relation: Relation): HasOne<R> {

    let source = this.database().object(
      FirebaseConnection.getRef(model).child(`r/${relation.call}`)
    ).map(model => {
      model = FirebaseConnection.processProperties(model);

      let keys = Object.keys(model);

      if(!keys.length) {
        return Observable.from([null]);
      }

      return this.ms.model<any>(relation.related)
        .get(keys[0]);
    }).switch();


    return new FirebaseHasOne<R>(source, model, relation);
  }

  key(model:T):any {
    return FirebaseConnection.getRef(model).key;
  }

  delete(entity:T | string) {
    if (isString(entity)) {
      entity = this.get(<string>entity);
    }

    let model:T = <T>entity;

    let upd = new MultiLocationUpdate(this.ref.database().ref());

    upd.add(FirebaseConnection.getRef(model), null);

    let deletes: Observable<firebase.database.Reference[]>[] = model.getRelations().map(relation => {
      return model.r[relation.call].take(1).map(related => {
        if(!related) {
          return;
        }

        // Call delete on child incase it needs to be deleted.
        // Separate MultiLocationUpdate creation to a separate function so we can combine a child deletion with this deletion

        if(isArray(related)) {
          return related.map(related_model => {
            return FirebaseConnection.getRef(related_model).child('r').child(relation.reverse.call).child(model.key());
          });
        } else if(related instanceof BaseModel) {
          return [
            FirebaseConnection.getRef(related).child('r').child(relation.reverse.call).child(model.key())
          ];
        } else {
          throw "Unknown relation value." + JSON.stringify(related);
        }
      });
    });

    Observable.combineLatest(...deletes)
      .map(refs => [].concat(...refs).filter(ref => ref))
      .take(1)
      .subscribe(refs => {
        refs.map(ref => {
          upd.add(ref, null);
        });

        upd.subscribe();
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

  updateOrCreate(obj:{}, key?:string): Observable<T> {
    if(!key) {
      key = this.list_ref.push().key;
    }

    let instance = this.newInstance();
    instance.setSource(this.list_ref.child(key));

    let upd = new MultiLocationUpdate(this.ref.database().ref(), instance);
    upd.add(this.child(`${key}/p`), obj);

    return upd;
  }
}
