import {ApplicationRef} from '@angular/core';
import {ModelServiceRef, ModelService, DatabaseConnectionRef} from "obsrm";
import {HorizonConnection} from "./horizon.connection";

import Horizon = require('@horizon/client');

export function ngProvideHorizonConnection(config) {
  // TODO move to service
  var horizon = Horizon(config);

  horizon.onReady(function() {
    // document.querySelector('h1').innerHTML = 'horizon works!'
    console.log('Horizon Ready!');
  });

  horizon.onDisconnected(function() {
    // document.querySelector('h1').innerHTML = 'horizon works!'
    console.log('Horizon Disconnected!');
  });
  horizon.connect();

  return {
    provide: DatabaseConnectionRef,
    useFactory: (app:ApplicationRef, ms: ModelService) => {
      let cache = {};

      return (type: string) => {
        return cache[type] = cache[type] || (new HorizonConnection(app, ms, horizon)).setType(type);
      };
    },
    deps: [ApplicationRef, ModelServiceRef]
  };
}
