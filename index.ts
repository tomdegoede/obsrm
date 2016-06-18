import {DatabaseInterface} from './database.interface';
export {FirebaseInterface} from "./firebase/firebase.interface";
export {ModelService} from "./model.service";
export {BaseModel, ModelObservable, ModelCollectionObservable, pushableCollection} from "./base_model";
export {TeamModel} from "./models/team-model";
export {UserModel} from "./models/user-model";
export {ProjectModel} from './models/project-model';
export {TaskModel} from './models/task-model';

import {provide, ApplicationRef} from "@angular/core";
import {BaseModel} from './base_model';
import {ModelService, TeamModel, UserModel, ProjectModel, TaskModel} from '.';
import {FirebaseInterface} from './firebase/firebase.interface';
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';

export const MODEL_PROVIDERS:any[] = [
  TeamModel,
  UserModel,
  ProjectModel,
  TaskModel,

  ModelService,

  provide(DatabaseInterface, {
    useFactory: (ref: Firebase, app: ApplicationRef, af: AngularFire) => {
      return () => {
        return new FirebaseInterface(app, ref, af);
      };
    },
    deps: [FirebaseRef, ApplicationRef, AngularFire]
  })
];
