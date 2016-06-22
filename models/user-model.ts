import {BaseModel, ModelService, ProjectModel, TeamModel} from '..';
import {Inject, Injectable} from "@angular/core";
import {ModelServiceRef} from '../model.service';

@Injectable()
export class UserModel extends BaseModel<UserModel> {
  constructor(@Inject(ModelServiceRef) protected ms: ModelService, protected _path) {
    super(ms, _path);
  }
}
