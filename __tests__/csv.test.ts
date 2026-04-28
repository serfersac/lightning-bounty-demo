import { describe, it, expect } from "vitest";
import { tasksToCSV, projectsToCSV, csvToTasks } from "@/lib/csv";
import type { Task, Project } from "@/lib/types";

const projects: Project[] = [
  { id: "p1", name: "My Project", description: "A project", status: "active", tags: [], createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" },
];

const tasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "Build feature",
    description: "Implement the main feature",
    status: "in-progress",
    priority: "high",
    tags: [{ id: "tag1", name: "frontend", color: "#f97316" }],
    assignee: "alice@example.com",
    dueDate: "2024-03-01",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "t2",
    projectId: "p1",
    title: 'Task with "quotes"',
    description: "Has commas, and quotes",
    status: "todo",
    priority: "low",
    tags: [],
    assignee: "",
    dueDate: null,
    createdAt: "2024-01-11T00:00:00Z",
    updatedAt: "2024-01-11T00:00:00Z",
  },
];

describe("tasksToCSV", () => {
  it("starts with correct headers", () => {
    const csv = tasksToCSV(tasks, projects);
    const firstLine = csv.split("\n")[0];
    expect(firstLine).toBe("id,projectId,project,title,description,status,priority,assignee,tags,dueDate,createdAt,updatedAt");
  });

  it("includes task data", () => {
    const csv = tasksToCSV(tasks, projects);
    expect(csv).toContain("Build feature");
    expect(csv).toContain("My Project");
    expect(csv).toContain("in-progress");
    expect(csv).toContain("frontend");
  });

  it("escapes cells with commas and quotes", () => {
    const csv = tasksToCSV(tasks, projects);
    expect(csv).toContain('"Task with ""quotes"""');
    expect(csv).toContain('"Has commas, and quotes"');
  });

  it("has correct number of rows", () => {
    const csv = tasksToCSV(tasks, projects);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3); // header + 2 tasks
  });
});

describe("projectsToCSV", () => {
  it("starts with correct headers", () => {
    const csv = projectsToCSV(projects);
    expect(csv.split("\n")[0]).toBe("id,name,description,status,tags,createdAt,updatedAt");
  });

  it("includes project data", () => {
    const csv = projectsToCSV(projects);
    expect(csv).toContain("My Project");
    expect(csv).toContain("active");
  });
});

describe("csvToTasks", () => {
    it("parses a simple CSV", () => {
        const csv = "projectId,title\np1,New Task";
        const { tasks: newTasks, malformedRows } = csvToTasks(csv, projects, []);
        expect(newTasks.length).toBe(1);
        expect(newTasks[0].title).toBe("New Task");
        expect(newTasks[0].projectId).toBe("p1");
        expect(malformedRows.length).toBe(0);
    });

    it("skips duplicates", () => {
        const csv = "projectId,title\np1,Build feature";
        const { tasks: newTasks } = csvToTasks(csv, projects, tasks);
        expect(newTasks.length).toBe(0);
    });

    it("handles malformed rows", () => {
        const csv = "projectId,title\np99,Task A\np1,Task B";
        const { tasks: newTasks, malformedRows } = csvToTasks(csv, projects, []);
        expect(newTasks.length).toBe(1);
        expect(newTasks[0].title).toBe("Task B");
        expect(malformedRows).toEqual([2]);
    });

    it("handles roundtrip", () => {
        const csv = tasksToCSV(tasks, projects);
        const { tasks: newTasks } = csvToTasks(csv, projects, []);
        expect(newTasks.length).toBe(2);
        expect(newTasks[0].title).toBe("Build feature");
        expect(newTasks[1].title).toBe('Task with "quotes"');
    });

    it("handles BOM, CRLF, and empty lines", () => {
        const csv = "\uFEFFprojectId,title\r\np1,Task 1\r\n\r\np1,Task 2";
        const { tasks: newTasks } = csvToTasks(csv, projects, []);
        expect(newTasks.length).toBe(2);
        expect(newTasks[0].title).toBe("Task 1");
        expect(newTasks[1].title).toBe("Task 2");
    });

    it("handles quoted commas", () => {
        const csv = 'projectId,title,description\np1,Task A,"Description, with comma"';
        const { tasks: newTasks } = csvToTasks(csv, projects, []);
        expect(newTasks.length).toBe(1);
        expect(newTasks[0].description).toBe("Description, with comma");
    });

    it("handles quoted multiline fields", () => {
        const csv = 'projectId,title,description\np1,Task A,"Line 1\nLine 2"';
        const { tasks: newTasks } = csvToTasks(csv, projects, []);
        expect(newTasks.length).toBe(1);
        expect(newTasks[0].description).toBe("Line 1\nLine 2");
    });
});
