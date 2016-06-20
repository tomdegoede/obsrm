export {BaseModel, ModelCollectionObservable} from "./base_model";
export {ModelService, ModelsConfig} from "./model.service";
export {TeamModel} from "./models/team-model";
export {UserModel} from "./models/user-model";
export {ProjectModel} from './models/project-model';
export {TaskModel} from './models/task-model';

import {provide, ApplicationRef} from "@angular/core";
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';
import {DatabaseInterface} from './database.interface';
import {FirebaseInterface} from './firebase/firebase.interface';
import {ModelService, ModelsConfig, BaseModel, TeamModel, UserModel, ProjectModel, TaskModel} from '.';
import {models} from './models';

export const MODEL_PROVIDERS:any[] = [
  provide(ModelsConfig, {
    useValue: models
  }),

  ModelService,

  provide(DatabaseInterface, {
    useFactory: (ref: Firebase, app: ApplicationRef, af: AngularFire) => {
      let cache = {};

      // TODO this caches by constructor.toString() which is potentially not always safe
      return (type) => {
        return /*cache[type] = cache[type] || */(new FirebaseInterface(app, ref, af)).setType(type);
      };
    },
    deps: [FirebaseRef, ApplicationRef, AngularFire]
  })
];
