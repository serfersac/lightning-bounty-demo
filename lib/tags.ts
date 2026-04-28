import type { Project, Tag } from "./types";
import { getProjects } from "./storage";

export function getAllTags(projectIds: string[]): Tag[] {
  const projects = getProjects().filter((p) => projectIds.includes(p.id));
  const tags: Tag[] = [];
  const tagSet = new Set<string>();

  for (const project of projects) {
    for (const tag of project.tags) {
      if (!tagSet.has(tag.id)) {
        tags.push(tag);
        tagSet.add(tag.id);
      }
    }
  }

  return tags;
}
