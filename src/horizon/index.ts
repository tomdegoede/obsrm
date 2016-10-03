import {Injector, OpaqueToken} from '@angular/core';
import {ModelServiceRef, ModelService, DatabaseConnectionRef} from "../../";
import {HorizonConnection} from "./horizon.connection";

import * as Horizon from "@horizon/client";

export function ngProvideHorizonConnection(config) {
  return {
    provide: DatabaseConnectionRef,
    useFactory: (injector:Injector, ms: ModelService) => {
      // TODO move to service
      var horizon = Horizon(config);

      horizon.onReady().subscribe(function() {
        // document.querySelector('h1').innerHTML = 'horizon works!'
        console.log('Horizon Ready!');
      });

      horizon.onDisconnected().subscribe(function() {
        // document.querySelector('h1').innerHTML = 'horizon works!'
        console.log('Horizon Disconnected!');
      });
      horizon.connect();

      let cache = {};

      return (type: string) => {
        return cache[type] = cache[type] || (new HorizonConnection(injector, ms, horizon)).setType(type);
      };
    },
    deps: [Injector, ModelServiceRef]
  };
}
