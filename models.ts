import {ProjectModel} from './models/project-model';
import {TaskModel} from './models/task-model';
import {UserModel} from './models/user-model';
import {TeamModel} from './models/team-model';

export var models = {
  "models": {
    "projects": {
      "class": ProjectModel
    },
    "tasks": {
      "class": TaskModel
    },
    "users": {
      "class": UserModel
    },
    "teams": {
      "class": TeamModel
    }
  },
  "relations": [
    "projects.tasks > tasks.project",
    "users.projects <> projects.users",
    "users.teams <> teams.users"
  ]
};
