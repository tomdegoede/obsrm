import {BaseModel, ModelService, UserModelService, ProjectModelService, ProjectModel} from '..';
import {Inject, Injectable} from "angular2/core";

@Injectable()
export class UserModel extends BaseModel<UserModel> {
  path():string {
    return 'users';
  }

  constructor(@Inject(UserModelService) protected service: ModelService<UserModel>,
              @Inject(ProjectModelService) protected ps: ModelService<ProjectModel>) {
    super(service);
  }

  teams() {

    // let injector = Injector.resolveAndCreate([
    //   TeamModel
    // ]);
    //
    // console.log(injector.get(TeamModel));

    // TODO somehow get hold of the app injector so we can use other model services

    return this.child('teams');
  }

  projects() {
    return this.ps.listFromRelation(
      this.child('projects')
    );
  }
}
