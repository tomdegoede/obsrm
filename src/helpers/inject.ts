import {Injector} from "@angular/core";
import {isPresent} from "../lang";

function _zipTypesAndAnnotations(paramTypes: any[], paramAnnotations: any[]): any[][] {
  var result: any[][];

  if (typeof paramTypes === 'undefined') {
    result = new Array(paramAnnotations.length);
  } else {
    result = new Array(paramTypes.length);
  }

  for (var i = 0; i < result.length; i++) {
    // TS outputs Object for parameters without types, while Traceur omits
    // the annotations. For now we preserve the Traceur behavior to aid
    // migration, but this can be revisited.
    if (typeof paramTypes === 'undefined') {
      result[i] = [];
    } else if (paramTypes[i] != Object) {
      result[i] = [paramTypes[i]];
    } else {
      result[i] = [];
    }
    if (paramAnnotations && isPresent(paramAnnotations[i])) {
      result[i] = result[i].concat(paramAnnotations[i]);
    }
  }
  return result;
}

function parameters(type) {
// API for metadata created by invoking the decorators.
  if (isPresent(Reflect) && isPresent(Reflect.getMetadata)) {
    const paramAnnotations = Reflect.getMetadata('parameters', type);
    const paramTypes = Reflect.getMetadata('design:paramtypes', type);
    if (paramTypes || paramAnnotations) {
      return _zipTypesAndAnnotations(paramTypes, paramAnnotations);
    }
  }
  // The array has to be filled with `undefined` because holes would be skipped by `some`
  return new Array((<any>type.length)).fill(undefined);
}

function factory(type) {
  return (...args) => new type(...args);
}

export function inject(type, injector: Injector, additional_arguments?) {
  if(!additional_arguments) {
    additional_arguments = [];
  }

  let args = parameters(type)
    .slice(0, -additional_arguments.length)
    .map(param => injector.get(param[1] ? param[1].token : param[0]))
    .concat(additional_arguments);

  return factory(type).apply(
    null, args
  );
}
