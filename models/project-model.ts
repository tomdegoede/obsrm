import {BaseModel, ModelService} from '..';
import {Injectable} from "@angular/core";
import {TaskModel} from './task-model';

@Injectable()
export class ProjectModel extends BaseModel<ProjectModel> {
  constructor(protected ms:ModelService) {
    super(ms);
  }

  tasks() {
    return this.hasMany(this.ms.model<TaskModel>(TaskModel), 'project', 'tasks');
  }
}
