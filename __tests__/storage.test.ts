import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getProjects,
  saveProject,
  getProject,
  deleteProject,
  getTasks,
  saveTask,
  getTask,
  deleteTask,
  clearAll,
} from "@/lib/storage";
import type { Project, Task } from "@/lib/types";
import { clear as idbClear } from "idb-keyval";

function makeProject(id: string): Project {
  return {
    id,
    name: `Project ${id}`,
    description: "desc",
    status: "active",
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function makeTask(id: string, projectId: string): Task {
  return {
    id,
    projectId,
    title: `Task ${id}`,
    description: "",
    status: "todo",
    priority: "medium",
    tags: [],
    assignee: "",
    dueDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

beforeEach(async () => {
  await clearAll();
  localStorage.clear();
});

afterEach(async () => {
  await idbClear();
});

describe("storage — projects", () => {
  it("returns seed projects on first load", async () => {
    const projects = await getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(3);
  });

  it("saves and retrieves a project", async () => {
    await clearAll();
    localStorage.clear();
    const p = makeProject("test-1");
    await saveProject(p);
    expect(await getProject("test-1")).toMatchObject({
      id: "test-1",
      name: "Project test-1",
    });
  });

  it("updates an existing project on save", async () => {
    await clearAll();
    localStorage.clear();
    const p = makeProject("test-2");
    await saveProject(p);
    await saveProject({ ...p, name: "Updated" });
    const projects = await getProjects();
    const found = projects.find((x) => x.id === "test-2");
    expect(found?.name).toBe("Updated");
  });

  it("deletes a project", async () => {
    await clearAll();
    localStorage.clear();
    const p = makeProject("test-3");
    await saveProject(p);
    await deleteProject("test-3");
    expect(await getProject("test-3")).toBeNull();
  });

  it("cascades task deletion when project is deleted", async () => {
    await clearAll();
    localStorage.clear();
    const p = makeProject("proj-x");
    const t = makeTask("task-x", "proj-x");
    await saveProject(p);
    await saveTask(t);
    await deleteProject("proj-x");
    expect(await getTask("task-x")).toBeNull();
  });
});

describe("storage — tasks", () => {
  it("saves and retrieves a task", async () => {
    await clearAll();
    localStorage.clear();
    const t = makeTask("task-1", "proj-1");
    await saveTask(t);
    expect(await getTask("task-1")).toMatchObject({ id: "task-1" });
  });

  it("filters tasks by projectId", async () => {
    await clearAll();
    localStorage.clear();
    await saveTask(makeTask("t1", "proj-a"));
    await saveTask(makeTask("t2", "proj-a"));
    await saveTask(makeTask("t3", "proj-b"));
    expect(await getTasks("proj-a")).toHaveLength(2);
    expect(await getTasks("proj-b")).toHaveLength(1);
  });

  it("deletes a task", async () => {
    await clearAll();
    localStorage.clear();
    const t = makeTask("del-task", "proj-1");
    await saveTask(t);
    await deleteTask("del-task");
    expect(await getTask("del-task")).toBeNull();
  });
});
