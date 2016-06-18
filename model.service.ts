import {BaseModel} from '.';
import {Inject, ApplicationRef} from "@angular/core";
import {DatabaseInterface} from './database.interface';

export abstract class ModelService {

  constructor(@Inject(ApplicationRef) protected app:ApplicationRef) {

  }

  public model<R extends BaseModel<R>>(type): DatabaseInterface<R> {
    let i: DatabaseInterface<R> = this.app.injector.get(DatabaseInterface)();
    i.setType(type);
    return i;
  }
  //
  // get Instance():T {
  //   if (this._instance === undefined) {
  //     this._instance = this.newInstance();
  //   }
  //
  //   return this._instance;
  // }
}
