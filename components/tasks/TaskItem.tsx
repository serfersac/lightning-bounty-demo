"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Task } from "@/lib/types";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TagBadge } from "@/components/tags/TagBadge";

interface TaskItemProps {
  task: Task;
  projectId: string;
  onDelete?: (id: string) => void;
  onUpdateStatus?: (id: string, newStatus: Task["status"]) => void;
}

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-zinc-400",
};

export function TaskItem({ task, projectId, onDelete, onUpdateStatus }: TaskItemProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus: Task["status"] = e.target.checked ? "completed" : "open";
    if (onUpdateStatus) {
      onUpdateStatus(task.id, newStatus);
      if (newStatus === "completed") {
        setShowConfetti(true);
      }
    }
  };

  return (
    <div className="border border-[--border] bg-[--surface] px-4 py-3 flex items-start gap-3 group hover:border-[--accent] transition-colors relative">
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1.5 + Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}
      <input
        type="checkbox"
        checked={task.status === "completed"}
        onChange={handleStatusChange}
        className="mt-1.5 shrink-0"
        aria-label="Mark task as complete"
      />
      {/* Priority indicator */}
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`}
        title={`Priority: ${task.priority}`}
        aria-label={`Priority: ${task.priority}`}
      />
      <div className="flex-1 min-w-0">
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
          className="opacity-0 group-hover:opacity-100 text-[--text-muted] hover:text-red-500 text-xs transition-all"
          aria-label={`Delete task ${task.title}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}
