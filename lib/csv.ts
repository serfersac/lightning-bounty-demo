import type { Task, Project } from "./types";

function escapeCell(value: string | null | undefined): string {
  const s = value ?? "";
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
    "projectId",
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
        task.projectId,
        projectMap.get(task.projectId) ?? "",
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

function parseCSV(csv: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  // Remove BOM
  if (csv.charCodeAt(0) === 0xFEFF) {
    csv = csv.substring(1);
  }

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < csv.length && csv[i + 1] === '"') {
          currentCell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell);
        currentCell = '';
      } else if (char === '\n' || char === '\r') {
        if (i + 1 < csv.length && csv[i + 1] === '\n') i++; // Handle CRLF
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell || currentRow.length) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  
  return rows;
}

export function csvToTasks(
  csv: string,
  projects: Project[],
  existingTasks: Task[]
): {
  tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[];
  malformedRows: number[];
} {
  const projectNameMap = new Map(projects.map((p) => [p.name, p.id]));
  const projectIdSet = new Set(projects.map((p) => p.id));
  const existingTaskTitles = new Set(
    existingTasks.map((t) => `${t.projectId}:${t.title}`)
  );

  const rows = parseCSV(csv);
  if (rows.length < 2) return { tasks: [], malformedRows: [] };

  const headers = rows[0].map((h) => h.trim());
  const tasks: Omit<Task, "id" | "createdAt" | "updatedAt">[] = [];
  const malformedRows: number[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.length === 1 && values[0] === '') continue; // Skip empty rows

    const rowData: { [key: string]: string } = {};
    for (let j = 0; j < headers.length; j++) {
      rowData[headers[j]] = values[j] ?? '';
    }

    let projectId = rowData["projectId"];
    if (!projectId || !projectIdSet.has(projectId)) {
      projectId = projectNameMap.get(rowData["project"]);
    }
    
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
      existingTaskTitles.add(`${projectId}:${title}`);
    } catch (e) {
      malformedRows.push(i + 1);
    }
  }

  return { tasks, malformedRows };
}
