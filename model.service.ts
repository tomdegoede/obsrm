import {BaseModel} from '.';
import {Inject, ApplicationRef} from "@angular/core";
import {DatabaseInterface} from './database.interface';

export abstract class ModelService {

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef) {

  }

  public model<R extends BaseModel<R>>(type): DatabaseInterface<R> {
    return this.app.injector.get(DatabaseInterface)(type);
  }
}
