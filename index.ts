import {DatabaseInterface} from './database.interface';
export {ModelService} from "./model.service";
export {BaseModel, ModelObservable, ModelCollectionObservable, pushableCollection} from "./base_model";
export {TeamModel} from "./models/team-model";
export {UserModel} from "./models/user-model";
export {ProjectModel} from './models/project-model';
export {TaskModel} from './models/task-model';

import {provide, ApplicationRef} from "@angular/core";
import {ModelService, BaseModel, TeamModel, UserModel, ProjectModel, TaskModel} from '.';
import {FirebaseInterface} from './firebase/firebase.interface';
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';

export const MODEL_PROVIDERS:any[] = [
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
