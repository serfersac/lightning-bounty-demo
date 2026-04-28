"use client";

import { useState, useMemo } from "react";
import type { Task, SortConfig, FilterConfig, ListItem, Tag } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { searchTasks } from "@/lib/search";
import { filterTasks } from "@/lib/filters";
import { sortTasks } from "@/lib/sort";
import { SearchBar } from "@/components/ui/SearchBar";
import { BulkTaskActions } from "./BulkTaskActions";

interface TaskListProps {
  tasks: ListItem<Task>[];
  projectId: string;
  onDelete?: (id: string) => void;
  onDeleteBulk?: (ids: string[]) => void;
  onMarkDoneBulk?: (ids: string[]) => void;
  onAddTagBulk?: (ids: string[], tag: Tag) => void;
  onToggleSelected?: (id: string) => void;
  onToggleAllSelected?: () => void;
}

export function TaskList({
  tasks,
  projectId,
  onDelete,
  onDeleteBulk,
  onMarkDoneBulk,
  onAddTagBulk,
  onToggleSelected,
  onToggleAllSelected,
}: TaskListProps) {
  const [search, setSearch] = useState("");
  const [sortConfig] = useState<SortConfig>({ field: "status", direction: "asc" });
  const [filterConfig] = useState<FilterConfig>({});

  const visible = useMemo(() => {
    let result = tasks;
    if (search) result = searchTasks(result, search);
    result = filterTasks(result, filterConfig);
    result = sortTasks(result, sortConfig);
    return result;
  }, [tasks, search, filterConfig, sortConfig]);

  const allSelected = useMemo(() => {
    return visible.length > 0 && visible.every((t) => t.isSelected);
  }, [visible]);

  if (tasks.length === 0) {
    return (
      <div className="border border-dashed border-[--border] p-8 text-center">
        <p className="font-mono text-sm text-[--text-muted]">No tasks yet</p>
        <p className="mt-1 text-xs text-[--text-muted]">Create a task to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tasks..."
          className="max-w-xs"
        />
        {onToggleAllSelected && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAllSelected}
              title={allSelected ? "Deselect all" : "Select all"}
              aria-label={allSelected ? "Deselect all" : "Select all"}
            />
            <span className="font-mono text-xs text-[--text-muted]">Select all</span>
          </div>
        )}
      </div>

      {onDeleteBulk && onMarkDoneBulk && onAddTagBulk && (
        <BulkTaskActions
          tasks={tasks}
          onDelete={onDeleteBulk}
          onMarkDone={onMarkDoneBulk}
          onAddTag={onAddTagBulk}
        />
      )}

      {visible.length === 0 ? (
        <p className="font-mono text-sm text-[--text-muted] py-4">No tasks match your search</p>
      ) : (
        <div className="space-y-1 stagger">
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectId={projectId}
              onDelete={onDelete}
              onToggleSelected={onToggleSelected}
            />
          ))}
        </div>
      )}
      <p className="font-mono text-xs text-[--text-muted]">
        {visible.length} of {tasks.length} tasks
      </p>
    </div>
  );
}
