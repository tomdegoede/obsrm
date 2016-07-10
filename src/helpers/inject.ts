import {Injector} from "@angular/core";
import {reflector} from "@angular/core/src/reflection/reflection";

export function inject(type, injector: Injector, additional_arguments?) {
  if(!additional_arguments) {
    additional_arguments = [];
  }

  let args = reflector.parameters(type)
    .slice(0, -additional_arguments.length)
    .map(param => injector.get(param[1] ? param[1].token : param[0]))
    .concat(additional_arguments);

  return reflector.factory(type).apply(
    null, args
  );
}
