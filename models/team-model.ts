import {BaseModel, ModelService, TeamModelService} from '..';
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class TeamModel extends BaseModel<TeamModel> {
  path():string {
    return 'teams';
  }

  constructor(@Inject(TeamModelService) protected service: ModelService<TeamModel>) {
    super(service);
  }
}
