import {BaseModel, ModelService} from '..';
import {Inject, Injectable} from "@angular/core";
import {TaskModel} from './task-model';
import {ModelServiceRef} from '../model.service';

@Injectable()
export class ProjectModel extends BaseModel<ProjectModel> {
  constructor(@Inject(ModelServiceRef) protected ms:ModelService, protected _path) {
    super(ms, _path);
  }
}
