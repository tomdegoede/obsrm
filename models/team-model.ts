import {BaseModel, ModelService} from '..';
import {Inject, Injectable} from "@angular/core";
import {ModelServiceRef} from '../model.service';

@Injectable()
export class TeamModel extends BaseModel<TeamModel> {
  constructor(@Inject(ModelServiceRef) ms: ModelService, protected _path) {
    super(ms, _path);
  }
}
