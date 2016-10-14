import {BaseModel} from './base_model';
import {Inject, Injectable, Injector} from "@angular/core";
import {DatabaseConnection} from './database.connection';
import {ModelsConfig, DatabaseConnectionRef} from "./tokens";

export interface Relation {
  model: string
  call: string
  related: string
  reverse?: Relation,
  type: 'many' | 'one'
}

@Injectable()
export class ModelService {

  protected relation_pairs: {left: Relation, right: Relation}[];

  constructor(protected injector:Injector, @Inject(ModelsConfig) protected models_config) {
    // 1.2 <3> 4.5
    this.relation_pairs = models_config.relations.map(relation => {
      return relation.match(/([^\.\s]+)\.([^\.\s]+)\s*(\<?\>?|=)\s*([^\.\s]+)\.([^\.\s]+)/);
    }).filter(r => !!r).map(relation => {
      let left: Relation = {
        model: relation[1],
        call: relation[2],
        related: relation[4],
        type: relation[3].indexOf(">") !== -1 ? 'many' : 'one'
      };

      let right: Relation = {
        model: relation[4],
        call: relation[5],
        related: relation[1],
        type: relation[3].indexOf("<") !== -1 ? 'many' : 'one',
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

  public model<R extends BaseModel<R>>(type: string): DatabaseConnection<R> {
    return this.injector.get(DatabaseConnectionRef)(type);
  }

  public getClass(type: string) {
    return this.config.models[type].class;
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
