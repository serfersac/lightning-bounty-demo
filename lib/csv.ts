import type { Task, Project } from "./types";

function escapeCell(value: string | null | undefined): string {
  const s = value ?? "";
  // Wrap in quotes if contains comma, quote, or newline
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cells: string[]): string {
  return cells.map(escapeCell).join(",");
}

export function tasksToCSV(tasks: Task[], projects: Project[]): string {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const headers = [
    "id",
    "project",
    "title",
    "description",
    "status",
    "priority",
    "assignee",
    "tags",
    "dueDate",
    "createdAt",
    "updatedAt",
  ];
  const lines = [headers.join(",")];

  for (const task of tasks) {
    lines.push(
      row([
        task.id,
        projectMap.get(task.projectId) ?? task.projectId,
        task.title,
        task.description,
        task.status,
        task.priority,
        task.assignee,
        task.tags.map((t) => t.name).join(";"),
        task.dueDate ?? "",
        task.createdAt,
        task.updatedAt,
      ])
    );
  }

  return lines.join("\n");
}

export function projectsToCSV(projects: Project[]): string {
  const headers = ["id", "name", "description", "status", "tags", "createdAt", "updatedAt"];
  const lines = [headers.join(",")];

  for (const p of projects) {
    lines.push(
      row([
        p.id,
        p.name,
        p.description,
        p.status,
        p.tags.map((t) => t.name).join(";"),
        p.createdAt,
        p.updatedAt,
      ])
    );
  }

  return lines.join("\n");
}

function parseCsvRow(line: string): string[] {
    const values: string[] = [];
    let current_value = '';
    let in_quotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (in_quotes && i + 1 < line.length && line[i + 1] === '"') {
                current_value += '"';
                i++;
            } else {
                in_quotes = !in_quotes;
            }
        } else if (char === ',' && !in_quotes) {
            values.push(current_value);
            current_value = '';
        } else {
            current_value += char;
        }
    }
    values.push(current_value);
    return values;
}

export function csvToTasks(
  csv: string,
  projects: Project[],
  existingTasks: Task[]
): {
  tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[];
  malformedRows: number[];
} {
  const projectMap = new Map(projects.map((p) => [p.name, p.id]));
  const existingTaskTitles = new Set(
    existingTasks.map((t) => `${t.projectId}:${t.title}`)
  );

  // Remove BOM
  if (csv.charCodeAt(0) === 0xFEFF) {
    csv = csv.substring(1);
  }
  
  const lines = csv.split(/\r?\n/);
  const headers = parseCsvRow(lines[0]).map((h) => h.trim());
  const tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[] = [];
  const malformedRows: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;

    const values = parseCsvRow(line);
    const rowData: { [key: string]: string } = {};
    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = values[j];
    }

    const projectName = rowData["project"];
    const projectId = projectMap.get(projectName);
    if (!projectId) {
      malformedRows.push(i + 1);
      continue;
    }

    const title = rowData["title"];
    if (!title || existingTaskTitles.has(`${projectId}:${title}`)) {
      continue;
    }

    try {
      tasks.push({
        projectId,
        title,
        description: rowData["description"] ?? "",
        status: rowData["status"] ?? "backlog",
        priority: rowData["priority"] ?? "none",
        assignee: rowData["assignee"] ?? "",
        tags: (rowData["tags"] ?? "")
          .split(";")
          .filter(name => name)
          .map((name) => ({ id: "", name, color: "" })),
        dueDate: rowData["dueDate"] || null,
      });
      existingTaskTitles.add(`${projectId}:${title}`); // Add to set to handle duplicates within the CSV
    } catch (e) {
      malformedRows.push(i + 1);
    }
  }

  return { tasks, malformedRows };
}
