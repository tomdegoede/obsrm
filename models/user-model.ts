import {BaseModel, ModelService, UserModelService, ProjectModelService, ProjectModel, TeamModelService, TeamModel} from '..';
import {Inject, Injectable} from "angular2/core";

@Injectable()
export class UserModel extends BaseModel<UserModel> {
  path():string {
    return 'users';
  }

  constructor(@Inject(UserModelService) protected service: ModelService<UserModel>,
              @Inject(ProjectModelService) protected ps: ModelService<ProjectModel>,
              @Inject(TeamModelService) protected ts: ModelService<TeamModel>) {
    super(service);
  }

  teams() {
    return this.ts.listFromRelation(
      this.child('teams'), 'users'
    );
  }

  projects() {
    return this.ps.listFromRelation(
      this.child('projects'), 'users'
    );
  }
}
