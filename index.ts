export {BaseModel} from "./base_model";
export {ModelCollectionObservable} from "./model_collection.interface";
export {ModelService, ModelsConfig, DatabaseConnectionRef, ModelServiceRef} from "./model.service";
export {TeamModel} from "./models/team-model";
export {UserModel} from "./models/user-model";
export {ProjectModel} from './models/project-model';
export {TaskModel} from './models/task-model';

import {provide, ApplicationRef} from "@angular/core";
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';
import {DatabaseConnectionRef, ModelServiceRef} from './model.service';
import {FirebaseConnection} from './firebase/firebase.connection';
import {ModelService, ModelsConfig, BaseModel, TeamModel, UserModel, ProjectModel, TaskModel} from '.';
import {models} from './models';

export const MODEL_PROVIDERS:any[] = [
  provide(ModelsConfig, {
    useValue: models
  }),

  provide(ModelServiceRef, {
    useClass: ModelService
  }),

  provide(DatabaseConnectionRef, {
    useFactory: (ref:Firebase, app:ApplicationRef, af:AngularFire, ms: ModelService) => {
      let cache = {};

      // TODO this caches by constructor.toString() which is potentially not always safe
      // We could restring it to the textual type format only, see src/services/model/model.service.ts:54
      return (type: string) => {
        return /*cache[type] = cache[type] || */(new FirebaseConnection(app, ref, af, ms)).setType(type);
      };
    },
    deps: [FirebaseRef, ApplicationRef, AngularFire, ModelServiceRef]
  })
];
