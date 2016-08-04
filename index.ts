export {ModelServiceRef, DatabaseConnectionRef, ModelsConfig} from "./src/tokens";
export {BaseModel} from "./src/base_model";
export {ModelCollectionObservable} from "./src/model_collection.interface";
export {ModelService} from "./src/model.service";

import {ModelServiceRef, DatabaseConnectionRef, ModelsConfig} from "./src/tokens";
import {provide, ApplicationRef} from "@angular/core";
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';
import {ModelService} from './src/model.service';
import {BaseModel} from "./src/base_model";
import {FirebaseConnection} from './src/firebase/firebase.connection';

// provide(ModelsConfig, {
//   useValue: models
// }),

export const MODEL_PROVIDERS:any[] = [
  { provide: ModelServiceRef, useClass: ModelService },
  {
    provide: DatabaseConnectionRef,
    useFactory: (ref:firebase.app.App, app:ApplicationRef, af:AngularFire, ms: ModelService) => {
      let cache = {};

      return (type: string) => {
        return cache[type] = cache[type] || (new FirebaseConnection(app, ref, af, ms)).setType(type);
      };
    },
    deps: [FirebaseRef, ApplicationRef, AngularFire, ModelServiceRef]
  },
];
