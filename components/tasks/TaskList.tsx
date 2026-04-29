"use client";

import { useState, useMemo } from "react";
import type { Task, SortConfig, FilterConfig } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { searchTasks } from "@/lib/search";
import { filterTasks } from "@/lib/filters";
import { sortTasks } from "@/lib/sort";
import { SearchBar } from "@/components/ui/SearchBar";
import { Select } from "@/components/ui/Select";

interface TaskListProps {
  tasks: Task[];
  projectId: string;
  onDelete?: (id: string) => void;
}

export function TaskList({ tasks, projectId, onDelete }: TaskListProps) {
  const [search, setSearch] = useState("");
  const [sortMethod, setSortMethod] = useState<"newest" | "highest-bounty">("newest");
  const sortConfig: SortConfig = useMemo(() => {
    if (sortMethod === "highest-bounty") {
      return { field: "bounty", direction: "desc" };
    }
    return { field: "createdAt", direction: "desc" };
  }, [sortMethod]);
  const [filterConfig] = useState<FilterConfig>({});

  const visible = useMemo(() => {
    let result = tasks;
    if (search) result = searchTasks(result, search);
    result = filterTasks(result, filterConfig);
    result = sortTasks(result, sortConfig);
    return result;
  }, [tasks, search, filterConfig, sortConfig]);

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
      <div className="flex justify-between items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tasks..."
          className="max-w-xs"
        />
        <Select
          value={sortMethod}
          onChange={(e) => setSortMethod(e.target.value as "newest" | "highest-bounty")}
          className="w-40"
        >
          <option value="newest">Newest First</option>
          <option value="highest-bounty">Highest Bounty</option>
        </Select>
      </div>
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
