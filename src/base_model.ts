import {Observable} from "rxjs";
import {ModelService, Relation} from './model.service';
import {ModelServiceRef} from "./tokens";
import {DatabaseConnection} from './database.connection';
import {ModelCollectionObservable} from './model_collection.interface';
import {Inject} from '@angular/core';

// TODO separate relations & properties for FireBase storage
export class BaseModel<T extends BaseModel<T>> extends Observable<T | any> {

  protected relations: Relation[] = [];
  protected relation_objects: {[key:string]:ModelCollectionObservable<any>} = {};
  protected properties: {[key:string]:any} = {};
  source_object: any;

  constructor(@Inject(ModelServiceRef) protected ms:ModelService, protected _path: string) {
    super();
    this.relations = this.ms.getRelations(this.path());
  }

  public setProperties(properties: {[key:string]:any}) {
    this.properties = properties;
    return this;
  }

  get p() {
    return this.properties;
  }

  // TODO more genericly typed
  get r(): {[key:string]:ModelCollectionObservable<any>} {
    return this.relation_objects;
  }

  getRelation(key) {
    if(this.relation_objects[key] === undefined) {
      return null;
    }

    return this.relation_objects[key];
  }

  public getRelations(): Relation[] {
    return this.relations;
  }

  path() {
    return this._path;
  }

  get service(): DatabaseConnection<T> {
    return <DatabaseConnection<T>>
      this.ms.model(this.path());
  }

  key() {
    return this.service.key(this.typed);
  }

  // Not sure why I can't just cast <T>this
  // Since this class is abstract meaning this is always derived this is safe
  get typed(): T {
    return <T><any>this;
  }

  setSource(source): T {
    this.service.processSourceObject(this.typed, source);
    this.source = this.service.newObservable(this.typed);

    // TODO cleaner way to process relations
    this.relation_objects = this.getRelations().reduce<{[key:string]:ModelCollectionObservable<any>}>((relation_objects, relation) => {
      relation_objects[relation.call] = this.hasMany(this.ms.model<any>(relation.related), relation.reverse.call, relation.call);
      return relation_objects;
    }, {});

    return this.typed;
  }

  /**
   * @param related related model service
   * @param other_key The key referencing this model on the related object
   * @param local_index An optional local index for drivers that don't support an automated index
   */
  hasMany<R extends BaseModel<R>>(
    related: DatabaseConnection<R>,
    other_key: string,
    local_index?: string): ModelCollectionObservable<R> {
    return this.service.hasMany<R>(this, related, other_key, local_index);
  }

  save() {
    this.service.updateOrCreate(this.properties, this.key());
  }

  delete() {
    return this.service.delete(this.typed);
  }
}
