import type { Task, SortConfig } from "./types";

export function sortTasks(tasks: Task[], config: SortConfig): Task[] {
  const { field, direction } = config;
  return [...tasks].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (aValue < bValue) {
      return direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });
}
