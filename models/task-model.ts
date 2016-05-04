import {BaseModel, ModelService, TaskModelService} from '..';
import {Inject, Injectable} from "angular2/core";

@Injectable()
export class TaskModel extends BaseModel<TaskModel> {
  path():string {
    return 'tasks';
  }

  constructor(@Inject(TaskModelService) protected service: ModelService<TaskModel>) {
    super(service);
  }
}
