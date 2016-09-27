export {ModelServiceRef, DatabaseConnectionRef, ModelsConfig} from "./src/tokens";
export {BaseModel} from "./src/base_model";
export {ModelCollectionObservable} from "./src/model_collection.interface";
export {ModelService} from "./src/model.service";
export {ngProvideFirebaseConnection} from "./src/firebase";
export {ngProvideHorizonConnection} from "./src/horizon";
export {DatabaseConnection} from "./src/database.connection";

import {ModelServiceRef} from "./src/tokens";
import {ModelService} from './src/model.service';

export const MODEL_PROVIDERS:any[] = [
  { provide: ModelServiceRef, useClass: ModelService },
];
