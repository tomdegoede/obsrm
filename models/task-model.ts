import {BaseModel, ModelService, TaskModelService} from '..';
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class TaskModel extends BaseModel<TaskModel> {
  path():string {
    return 'tasks';
  }

  constructor(@Inject(TaskModelService) protected service: ModelService<TaskModel>) {
    super(service);
  }
}
