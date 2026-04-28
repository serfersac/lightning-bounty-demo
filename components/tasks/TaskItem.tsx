"use client";

import Link from "next/link";
import type { Task } from "@/lib/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TagBadge } from "@/components/tags/TagBadge";

interface TaskItemProps {
  task: Task;
  projectId: string;
  onDelete?: (id: string) => void;
}

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-zinc-400",
};

export function TaskItem({ task, projectId, onDelete }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-[--border] bg-[--surface] flex items-start gap-3 group transition-colors relative ${
        isDragging ? "shadow-lg border-[--accent]" : "hover:border-[--accent]"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="touch-none flex-shrink-0 flex items-center justify-center w-8 h-full cursor-grab active:cursor-grabbing"
        style={{ height: "auto", alignSelf: "stretch" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </div>

      {/* Priority indicator */}
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`}
        title={`Priority: ${task.priority}`}
        aria-label={`Priority: ${task.priority}`}
      />
      <div className="flex-1 min-w-0 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/projects/${projectId}/tasks/${task.id}`}
            className="font-medium text-sm text-[--text] hover:text-[--accent] transition-colors truncate"
          >
            {task.title}
          </Link>
          <TaskStatusBadge status={task.status} />
        </div>
        {task.description && (
          <p className="mt-0.5 text-xs text-[--text-muted] line-clamp-1">{task.description}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
          {task.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
          {task.assignee && (
            <span className="font-mono text-xs text-[--text-muted]">{task.assignee}</span>
          )}
          {task.dueDate && (
            <span className="font-mono text-xs text-[--text-muted]">due {task.dueDate}</span>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-[--text-muted] hover:text-red-500 text-xs transition-all px-4 self-stretch flex items-center"
          aria-label={`Delete task ${task.title}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}
