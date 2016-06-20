import {reflector, Injector} from "@angular/core";

export function inject(type, injector: Injector) {
  return reflector.factory(type).apply(
    null, reflector.parameters(type)
      .map(param => injector.get(param[0]))
  );
}
