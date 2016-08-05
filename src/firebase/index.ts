import {ApplicationRef} from "@angular/core";
import {AngularFire, FirebaseRef} from 'angularfire2/angularfire2';
import {ModelServiceRef, ModelService, DatabaseConnectionRef} from "obsrm";
import {FirebaseConnection} from './firebase.connection';

export function ngProvideFirebaseConnection() {
  return {
    provide: DatabaseConnectionRef,
    useFactory: (ref:firebase.app.App, app:ApplicationRef, af:AngularFire, ms: ModelService) => {
      let cache = {};

      return (type: string) => {
        return cache[type] = cache[type] || (new FirebaseConnection(app, ref, af, ms)).setType(type);
      };
    },
    deps: [FirebaseRef, ApplicationRef, AngularFire, ModelServiceRef]
  };
}
