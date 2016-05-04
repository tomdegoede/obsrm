import {BaseModel, ModelService, TeamModelService, TaskModelService} from '..';
import {Inject, Injectable} from "angular2/core";
import {TaskModel} from './task-model';

@Injectable()
export class ProjectModel extends BaseModel<ProjectModel> {
  path():string {
    return 'projects';
  }

  constructor(@Inject(TeamModelService) protected service: ModelService<ProjectModel>,
              @Inject(TaskModelService) protected ts: ModelService<TaskModel>) {
    super(service);
  }

  tasks() {
    return this.ts.listFromRelation(
      this.child('tasks'), 'project'
    );
  }
}
