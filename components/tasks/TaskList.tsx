"use client";

import { useState, useMemo } from "react";
import type { Task, SortConfig, FilterConfig } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { TaskItem } from "./TaskItem";
import { searchTasks } from "@/lib/search";
import { filterTasks } from "@/lib/filters";
import { sortTasks } from "@/lib/sort";
import { reorderTasks } from "@/lib/storage";
import { SearchBar } from "@/components/ui/SearchBar";

interface TaskListProps {
  tasks: Task[];
  projectId: string;
  onDelete?: (id: string) => void;
  onReorder: (reorderedTasks: Task[]) => void;
}

export function TaskList({ tasks, projectId, onDelete, onReorder }: TaskListProps) {
  const [search, setSearch] = useState("");
  const [sortConfig] = useState<SortConfig>({ field: "status", direction: "asc" });
  const [filterConfig] = useState<FilterConfig>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = visible.findIndex((task) => task.id === active.id);
      const newIndex = visible.findIndex((task) => task.id === over?.id);
      const reordered = reorderTasks(projectId, oldIndex, newIndex);
      onReorder(reordered);
    }
  }
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
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search tasks..."
        className="max-w-xs"
      />
      {visible.length === 0 ? (
        <p className="font-mono text-sm text-[--text-muted] py-4">No tasks match your search</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext items={visible} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {visible.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <p className="font-mono text-xs text-[--text-muted]">
        {visible.length} of {tasks.length} tasks
      </p>
    </div>
  );
}
