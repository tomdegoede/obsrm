import {provide, OpaqueToken, ApplicationRef} from "@angular/core";

// Export these before before initializing models so they are defined.
export const UserModelService = new OpaqueToken('UserModelService');
export const TeamModelService = new OpaqueToken('TeamModelService');
export const ProjectModelService = new OpaqueToken('ProjectModelService');
export const TaskModelService = new OpaqueToken('TaskModelService');

export {FirebaseModelService} from "./firebase/firebase_model.service";
export {ModelService} from "./model.service";
export {BaseModel, ModelObservable, ModelCollectionObservable, pushableCollection} from "./base_model";
export {TeamModel} from "./models/team-model";
export {UserModel} from "./models/user-model";
export {ProjectModel} from './models/project-model';
export {TaskModel} from './models/task-model';

import {BaseModel} from './base_model';
import {ModelService, TeamModel, UserModel, ProjectModel, TaskModel} from '.';
import {FirebaseRef, AngularFire} from "angularfire2";
import {FirebaseModelService} from './firebase/firebase_model.service';

interface modelAndService {
  model;
  service;
}

let modelServiceMap:modelAndService[] = [
  {model: TeamModel, service: TeamModelService},
  {model: UserModel, service: UserModelService},
  {model: ProjectModel, service: ProjectModelService},
  {model: TaskModel, service: TaskModelService},
];

export const MODEL_PROVIDERS:any[] = [
  modelServiceMap.map(
    o => provide(o.service, {
      useFactory: (ref:Firebase, app:ApplicationRef, af:AngularFire) => {
        let p = new FirebaseModelService(app, ref, af);
        p.setType(o.model);
        return p;
      },
      deps: [FirebaseRef, ApplicationRef, AngularFire]
    })
  ),

  modelServiceMap.map(o => o.model)
];
