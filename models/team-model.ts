import {BaseModel, ModelService} from '..';
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class TeamModel extends BaseModel<TeamModel> {
  path():string {
    return 'teams';
  }

  constructor(ms: ModelService) {
    super(ms);
  }
}
