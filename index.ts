export {ModelServiceRef, DatabaseConnectionRef, ModelsConfig} from "./src/tokens";
export {BaseModel} from "./src/base_model";
export {HasMany} from "./src/interface/has_many.interface";
export {ModelService} from "./src/model.service";
export {DatabaseConnection} from "./src/database.connection";

import {ModelServiceRef} from "./src/tokens";
import {ModelService} from './src/model.service';

export const MODEL_PROVIDERS:any[] = [
  { provide: ModelServiceRef, useClass: ModelService },
];
