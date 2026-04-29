import type { Task } from "./types";

export function searchTasks(tasks: Task[], search: string): Task[] {
  if (!search) return tasks;
  const lowercasedSearch = search.toLowerCase();
  return tasks.filter((task) => {
    const titleMatch = task.title.toLowerCase().includes(lowercasedSearch);
    const descriptionMatch = task.description?.toLowerCase().includes(lowercasedSearch);
    return titleMatch || descriptionMatch;
  });
}
