import {BaseModel} from './base_model';

export var models = {
  "models": {
    "projects": {
      "class": BaseModel
    },
    "tasks": {
      "class": BaseModel
    },
    "users": {
      "class": BaseModel
    },
    "teams": {
      "class": BaseModel
    }
  },
  "relations": [
    "projects.tasks > tasks.project",
    "users.projects <> projects.users",
    "users.teams <> teams.users"
  ]
};
