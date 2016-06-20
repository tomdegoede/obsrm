import {BaseModel} from '.';
import {Inject, ApplicationRef, OpaqueToken} from "@angular/core";
import {DatabaseInterface} from './database.interface';
import {isString} from '@angular/core/src/facade/lang';

export const ModelsConfig = new OpaqueToken('ModelsConfig');

export interface Relation {
  model: string
  call: string
  related: string
  reverse?: Relation
}

export abstract class ModelService {

  protected relation_pairs: {left: Relation, right: Relation}[];

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef, @Inject(ModelsConfig) protected models_config) {
    // 1.2 <3> 4.5
    this.relation_pairs = models_config.relations.map(relation => {
      return relation.match(/([^\.\s]+)\.([^\.\s]+)\s*(\<?\>?|=)\s*([^\.\s]+)\.([^\.\s]+)/);
    }).filter(r => !!r).map(relation => {
      let left: Relation = {
        model: relation[1],
        call: relation[2],
        related: relation[4]
      };

      let right: Relation = {
        model: relation[4],
        call: relation[5],
        related: relation[1],
        reverse: left
      };

      left.reverse = right;

      return {
        left: left,
        right: right
      };
    });
  }

  get config() {
    return this.models_config;
  }

  public model<R extends BaseModel<R>>(type): DatabaseInterface<R> {
    if(isString(type)) {
      type = this.config.models[type].class;
    }

    return this.app.injector.get(DatabaseInterface)(type);
  }

  public getRelations(path: string): Relation[] {
    return this.relation_pairs.reduce((relations, relation_pair) => {
      if(relation_pair.left.model === path) {
        relations.push(relation_pair.left);
      }

      if(relation_pair.right.model === path) {
        relations.push(relation_pair.right);
      }

      return relations;
    }, []);
  }
}
