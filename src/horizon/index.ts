import {ApplicationRef} from '@angular/core';
import {ModelServiceRef, ModelService, DatabaseConnectionRef} from "obsrm";
import {HorizonCnnection} from "./horizon.connection";

import Horizon = require('@horizon/client');

export function ngProvideHorizonConnection(config) {
  // TODO move to service
  var horizon = Horizon(config);

  horizon.onReady(function() {
    // document.querySelector('h1').innerHTML = 'horizon works!'
    console.log('Horizon Ready!');
  });
  horizon.connect();

  return {
    provide: DatabaseConnectionRef,
    useFactory: (app:ApplicationRef, ms: ModelService) => {
      let cache = {};

      return (type: string) => {
        return cache[type] = cache[type] || (new HorizonCnnection(app, ms, horizon)).setType(type);
      };
    },
    deps: [ApplicationRef, ModelServiceRef]
  };
}
