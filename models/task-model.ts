import {BaseModel, ModelService} from '..';
import {Inject, Injectable} from "@angular/core";
import {ModelServiceRef} from '../model.service';

@Injectable()
export class TaskModel extends BaseModel<TaskModel> {
  constructor(@Inject(ModelServiceRef) protected ms: ModelService, protected _path) {
    super(ms, _path);
  }
}
