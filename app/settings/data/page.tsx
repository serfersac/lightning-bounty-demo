"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { exportRaw, clearAll, saveTasks, getProjects, getTasks } from "@/lib/storage";
import { tasksToCSV, projectsToCSV, csvToTasks } from "@/lib/csv";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import type { Task, Project } from "@/lib/types";

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DataPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleExportTasks() {
    const { projects, tasks } = exportRaw();
    downloadCSV(tasksToCSV(tasks, projects), "project-tracker-tasks.csv");
    showToast("Tasks exported as CSV", "success");
  }

  function handleExportProjects() {
    const { projects } = exportRaw();
    downloadCSV(projectsToCSV(projects), "project-tracker-projects.csv");
    showToast("Projects exported as CSV", "success");
  }

  function handleImportTasks(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const projects = getProjects();
      const existingTasks = getTasks();
      const { tasks: newTasks, malformedRows } = csvToTasks(csv, projects, existingTasks);
      
      if (newTasks.length > 0) {
        const currentTasks = getTasks();
        saveTasks([...currentTasks, ...newTasks.map(t => ({...t, id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}))]);
        showToast(`${newTasks.length} tasks imported successfully`, "success");
      }
      
      if (malformedRows.length > 0) {
        showToast(`Skipped ${malformedRows.length} malformed or duplicate rows`, "warning");
      }
      
      if (newTasks.length === 0 && malformedRows.length === 0) {
        showToast("No new tasks to import", "info");
      }
      
      // Reset file input
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }

  function handleClear() {
    if (!confirm("Clear all data? This cannot be undone.")) return;
    setClearing(true);
    clearAll();
    showToast("All data cleared", "info");
    // Reload to reseed
    setTimeout(() => { router.push("/"); }, 500);
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-[--text] mb-6">Data</h1>

      <section className="mb-8">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[--text-muted] mb-3">Import & Export</h2>
        <div className="border border-[--border] bg-[--surface] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[--text]">Import tasks from CSV</p>
              <p className="text-xs text-[--text-muted]">Duplicates and malformed rows will be skipped</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} aria-label="Import tasks CSV">
              Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportTasks}
              accept=".csv"
              className="hidden"
            />
          </div>
          <div className="flex items-center justify-between border-t border-[--border] pt-3">
            <div>
              <p className="text-sm font-medium text-[--text]">Export tasks as CSV</p>
              <p className="text-xs text-[--text-muted]">All tasks with project names, status, priority</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportTasks} aria-label="Export tasks CSV">
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between border-t border-[--border] pt-3">
            <div>
              <p className="text-sm font-medium text-[--text]">Export projects as CSV</p>
              <p className="text-xs text-[--text-muted]">All projects with metadata</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportProjects} aria-label="Export projects CSV">
              Export
            </Button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-widest text-[--text-muted] mb-3">Danger Zone</h2>
        <div className="border border-red-200 dark:border-red-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[--text]">Clear all data</p>
              <p className="text-xs text-[--text-muted]">Removes all projects and tasks. Seed data will reload.</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleClear}
              disabled={clearing}
              aria-label="Clear all data"
            >
              Clear
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
