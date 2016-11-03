import {Observable} from "rxjs";
import {ModelService, Relation} from './model.service';
import {ModelServiceRef} from "./tokens";
import {DatabaseConnection} from './database.connection';
import {HasMany} from './interface/has_many.interface';
import {Inject} from '@angular/core';
import {HasOne} from './interface/has_one.interface';
import {Has} from './interface/has.interface';

export type RelationMap = {[key:string]:Has<any>};

// TODO separate relations & properties for FireBase storage
export class BaseModel<T extends BaseModel<T>> extends Observable<T | any> {

  protected relations: Relation[] = [];
  protected relation_objects: RelationMap = {};
  protected properties: {[key:string]:any} = {};
  source_object: any;

  constructor(@Inject(ModelServiceRef) public ms:ModelService, protected _path: string) {
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
  get r(): RelationMap {
    return this.relation_objects;
  }

  getProperty(key) {
    return this.properties[key];
  }

  getRelation(key) {
    return this.relation_objects[key];
  }

  getManyRelation(key): HasMany<any> {
    let relation = this.ms.getRelation(this.path(), key);

    if(relation) {
      if(relation.type !== 'many') {
        console.warn(`Calling getManyRelation ${key} on ${this.path()} while it is defined as a ${relation.type} relationship`);
      }
    } else {
      console.warn(`Calling getManyRelation ${key} on ${this.path()} but the relation is not defined`);
    }

    return <HasMany<any>>this.getRelation(key);
  }

  getOneRelation(key): HasOne<any> {
    let relation = this.ms.getRelation(this.path(), key);

    if(relation) {
      if(relation.type !== 'one') {
        console.warn(`Calling getOneRelation ${key} on ${this.path()} while it is defined as a ${relation.type} relationship`);
      }
    } else {
      console.warn(`Calling getOneRelation ${key} on ${this.path()} but the relation is not defined`);
    }

    return <HasOne<any>>this.getRelation(key);
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
    let key = this.service.key(this.typed);

    if(!key) {
      console.log('Missing model Key! Probably because the model is obtained trough first() on a collection which requires a subscription before the ID is known.');
    }

    return key;
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
    this.relation_objects = this.getRelations()
      .filter(relation => relation.call)
      .reduce<RelationMap>((relation_objects, relation) => {
        switch (relation.type) {
          case 'one':
            relation_objects[relation.call] = this.hasOne(relation);
            break;
          case 'many':
            relation_objects[relation.call] = this.hasMany(this.ms.model<any>(relation.related), relation.reverse.call, relation.call);
            break;
        }

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
    local_index?: string): HasMany<R> {
    return this.service.hasMany<R>(this, related, other_key, local_index);
  }

  hasOne<R extends BaseModel<R>>(relation: Relation): HasOne<R> {
    return this.service.hasOne<R>(this, relation);
  }

  save() {
    return this.service.updateOrCreate(this.properties, this.key());
  }

  delete() {
    return this.service.delete(this.typed);
  }
}
