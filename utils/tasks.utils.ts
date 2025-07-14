import { RequestBodyTask } from "../types/tasks/tasks.types";

export function validateUserTask(userTask: RequestBodyTask) {
  return {
    invalidTasks: !userTask.status || userTask.status.trim() === "",
    invalidName: !userTask.name || userTask.name.trim() === "",
    invalidDate: !userTask.date?.startDate || !userTask.date?.dueDate,
    invalidPriorityStatus:
      !userTask.priority || userTask.priority.trim() === "",
    validTags: Array.isArray(userTask.tags) && userTask.tags.length > 0,
    hasSubTasks:
      Array.isArray(userTask.subTasks) && userTask.subTasks.length > 0,
  };
}
