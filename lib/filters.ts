import type { Task, FilterConfig } from "./types";

export function filterTasks(tasks: Task[], config: FilterConfig): Task[] {
  let result = tasks;
  if (config.status) {
    result = result.filter((task) => config.status?.includes(task.status));
  }
  if (config.priority) {
    result = result.filter((task) => config.priority?.includes(task.priority));
  }
  if (config.tags) {
    result = result.filter((task) =>
      config.tags?.every((tag) => task.tags.includes(tag))
    );
  }
  return result;
}
