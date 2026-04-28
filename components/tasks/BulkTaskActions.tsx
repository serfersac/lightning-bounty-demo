"use client";

import { useState, type KeyboardEvent } from "react";
import type { ListItem, Task, Tag } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const TAG_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ec4899", "#f59e0b", "#14b8a6"];

interface BulkTaskActionsProps {
  tasks: ListItem<Task>[];
  onMarkDone: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
  onAddTag: (ids: string[], tag: Tag) => void;
}

export function BulkTaskActions({ tasks, onMarkDone, onDelete, onAddTag }: BulkTaskActionsProps) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const selected = tasks.filter((t) => t.isSelected);

  if (selected.length === 0) {
    return null;
  }

  const taskIds = selected.map((t) => t.id);

  function addTag() {
    const name = tagInput.trim().toLowerCase();
    if (!name) {
      setTagInput("");
      setShowTagInput(false);
      return;
    }
    const color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
    const newTag: Tag = { id: `tag-${Date.now()}`, name, color };
    onAddTag(taskIds, newTag);
    setTagInput("");
    setShowTagInput(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Escape") {
      setShowTagInput(false);
      setTagInput("");
    }
  }

  return (
    <div className="border border-[--border] bg-[--surface-muted] p-3 flex items-center justify-between">
      <p className="font-mono text-sm">{selected.length} selected</p>
      <div className="flex items-center gap-2">
        {showTagInput ? (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder="Add tag and press Enter..."
            className="w-48 bg-transparent border border-[--border] px-2 py-1 text-sm"
            autoFocus
          />
        ) : (
          <Button onClick={() => setShowTagInput(true)} size="sm">
            Add tag
          </Button>
        )}
        <Button onClick={() => onMarkDone(taskIds)} size="sm" variant="ghost">
          Mark done
        </Button>
        <Button onClick={() => onDelete(taskIds)} size="sm" variant="ghost" className="text-red-500">
          Delete
        </Button>
      </div>
    </div>
  );
}
