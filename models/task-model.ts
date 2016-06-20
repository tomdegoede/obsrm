import {BaseModel, ModelService} from '..';
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class TaskModel extends BaseModel<TaskModel> {
  constructor(protected ms: ModelService) {
    super(ms);
  }
}
