export {BaseModel} from "./src/base_model";
export {ModelCollectionObservable} from "./src/model_collection.interface";
export {ModelService, ModelServiceRef, DatabaseConnectionRef, ModelsConfig} from "./src/model.service";

import {provide, ApplicationRef} from "@angular/core";
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';
import {ModelService, ModelServiceRef, DatabaseConnectionRef, ModelsConfig, BaseModel} from '.';
import {FirebaseConnection} from './src/firebase/firebase.connection';

// provide(ModelsConfig, {
//   useValue: models
// }),

export const MODEL_PROVIDERS:any[] = [
  provide(ModelServiceRef, {
    useClass: ModelService
  }),

  provide(DatabaseConnectionRef, {
    useFactory: (ref:firebase.database.Reference, app:ApplicationRef, af:AngularFire, ms: ModelService) => {
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
