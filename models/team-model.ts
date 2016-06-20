import {BaseModel, ModelService} from '..';
import {Inject, Injectable} from "@angular/core";

@Injectable()
export class TeamModel extends BaseModel<TeamModel> {
  constructor(ms: ModelService) {
    super(ms);
  }
}
