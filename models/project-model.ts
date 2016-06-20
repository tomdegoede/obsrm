import {BaseModel, ModelService} from '..';
import {Inject, Injectable} from "@angular/core";
import {TaskModel} from './task-model';
import {Model} from '../relations';

@Injectable()
@Model("projects")
export class ProjectModel extends BaseModel<ProjectModel> {
  path():string {
    return 'projects';
  }

  constructor(protected ms:ModelService) {
    super(ms);
  }

  tasks() {
    return this.hasMany(this.ms.model<TaskModel>(TaskModel), 'project', 'tasks');
  }
}
