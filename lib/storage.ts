import { get, set, clear, del, update } from "idb-keyval";
import type { Project, Task } from "./types";
import { SEED_PROJECTS, SEED_TASKS } from "./seed";

const PROJECTS_KEY = "pt_projects";
const TASKS_KEY = "pt_tasks";
const MIGRATION_KEY = "pt_migration_done";
const KEYS_TO_CLEAR = [PROJECTS_KEY, TASKS_KEY, MIGRATION_KEY];

async function isBrowser(): Promise<boolean> {
  return typeof window !== "undefined";
}

async function supportsIndexedDB(): Promise<boolean> {
  if (!(await isBrowser())) return false;
  return new Promise((resolve) => {
    try {
      const db = indexedDB.open("__test");
      db.onsuccess = () => {
        db.result.close();
        resolve(true);
      };
      db.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

async function readStorage<T>(key: string): Promise<T | null> {
  if (!(await isBrowser())) return null;
  if (await supportsIndexedDB()) {
    const val = await get<T>(key);
    return val ?? null;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error parsing localStorage item for key "${key}":`, error);
    return null;
  }
}

async function writeStorage<T>(key: string, data: T): Promise<void> {
  if (!(await isBrowser())) return;
  if (await supportsIndexedDB()) {
    await set(key, data);
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

async function deleteStorage(key: string): Promise<void> {
  if (!(await isBrowser())) return;
  if (await supportsIndexedDB()) {
    await del(key);
  } else {
    localStorage.removeItem(key);
  }
}

async function clearAllStorage(): Promise<void> {
  if (!(await isBrowser())) return;
  if (await supportsIndexedDB()) {
    await clear(); // idb-keyval clear is scoped to its own store
  } else {
    // Only remove our specific keys from localStorage
    KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("pt_theme"); // Assuming theme is also a pt_ key
    localStorage.removeItem("pt_locale"); // Assuming locale is also a pt_ key
  }
}

async function migrateFromLocalStorage(): Promise<void> {
  if (localStorage.getItem(MIGRATION_KEY)) return;

  const projectsRaw = localStorage.getItem(PROJECTS_KEY);
  if (projectsRaw) {
    try {
      await writeStorage(PROJECTS_KEY, JSON.parse(projectsRaw));
    } catch (error) {
      console.error("Error migrating projects from localStorage:", error);
    }
  }

  const tasksRaw = localStorage.getItem(TASKS_KEY);
  if (tasksRaw) {
    try {
      await writeStorage(TASKS_KEY, JSON.parse(tasksRaw));
    } catch (error) {
      console.error("Error migrating tasks from localStorage:", error);
    }
  }
  localStorage.setItem(MIGRATION_KEY, "true");
}

async function ensureSeeded(): Promise<void> {
  if (!(await isBrowser())) return;

  if (await supportsIndexedDB()) {
    await migrateFromLocalStorage();
  }

  const existingProjects = await readStorage(PROJECTS_KEY);
  const existingTasks = await readStorage(TASKS_KEY);
  if (existingProjects === null && existingTasks === null) {
    await writeStorage(PROJECTS_KEY, SEED_PROJECTS);
    await writeStorage(TASKS_KEY, SEED_TASKS);
  }
}

// Projects
export async function getProjects(): Promise<Project[]> {
  await ensureSeeded();
  return (await readStorage<Project[]>(PROJECTS_KEY)) ?? [];
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id) ?? null;
}

export async function saveProject(project: Project): Promise<void> {
  if (await supportsIndexedDB()) {
    await update(PROJECTS_KEY, (projects: Project[] = []) => {
      const idx = projects.findIndex((p) => p.id === project.id);
      if (idx >= 0) {
        projects[idx] = project;
      } else {
        projects.push(project);
      }
      return projects;
    });
  } else {
    const projects = await getProjects(); // Fallback uses the non-atomic read
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      projects[idx] = project;
    } else {
      projects.push(project);
    }
    await writeStorage(PROJECTS_KEY, projects);
  }
}

export async function deleteProject(id: string): Promise<void> {
  if (await supportsIndexedDB()) {
    await update(PROJECTS_KEY, (projects: Project[] = []) =>
      projects.filter((p) => p.id !== id),
    );
    await update(TASKS_KEY, (tasks: Task[] = []) =>
      tasks.filter((t) => t.projectId !== id),
    );
  } else {
    const projects = (await getProjects()).filter((p) => p.id !== id);
    await writeStorage(PROJECTS_KEY, projects);
    // Cascade delete tasks
    const tasks = (await getTasks()).filter((t) => t.projectId !== id);
    await writeStorage(TASKS_KEY, tasks);
  }
}

// Tasks
export async function getTasks(projectId?: string): Promise<Task[]> {
  await ensureSeeded();
  const all = (await readStorage<Task[]>(TASKS_KEY)) ?? [];
  return projectId ? all.filter((t) => t.projectId === projectId) : all;
}

export async function getTask(id: string): Promise<Task | null> {
  const tasks = await getTasks();
  return tasks.find((t) => t.id === id) ?? null;
}

export async function saveTask(task: Task): Promise<void> {
  if (await supportsIndexedDB()) {
    await update(TASKS_KEY, (tasks: Task[] = []) => {
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        tasks[idx] = task;
      } else {
        tasks.push(task);
      }
      return tasks;
    });
  } else {
    const tasks = await getTasks(); // Fallback uses the non-atomic read
    const idx = tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.push(task);
    }
    await writeStorage(TASKS_KEY, tasks);
  }
}

export async function deleteTask(id: string): Promise<void> {
  if (await supportsIndexedDB()) {
    await update(TASKS_KEY, (tasks: Task[] = []) =>
      tasks.filter((t) => t.id !== id),
    );
  } else {
    const tasks = (await getTasks()).filter((t) => t.id !== id);
    await writeStorage(TASKS_KEY, tasks);
  }
}

export async function clearAll(): Promise<void> {
  await clearAllStorage();
}

export async function exportRaw(): Promise<{
  projects: Project[];
  tasks: Task[];
}> {
  return { projects: await getProjects(), tasks: await getTasks() };
}
