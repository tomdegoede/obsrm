import {BaseModel, ModelService, ProjectModel, TeamModel} from '..';
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class UserModel extends BaseModel<UserModel> {
  constructor(protected ms: ModelService) {
    super(ms);
  }
}
