"use client";

import { useState } from "react";
import Link from "next/link";
import { TodoItem, type Todo } from "@/components/TodoItem";

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: "1",
      text: "Read the bounty spec",
      done: true,
      reward: 100,
      createdAt: "2023-01-01T10:00:00Z",
    },
    {
      id: "2",
      text: "Add dark mode toggle",
      done: false,
      reward: 200,
      createdAt: "2023-01-02T12:00:00Z",
    },
    {
      id: "3",
      text: "Implement task sorting logic",
      done: false,
      reward: 150,
      createdAt: "2023-01-03T14:00:00Z",
    },
    {
      id: "4",
      text: "Write unit tests for sorting",
      done: false,
      reward: 250,
      createdAt: "2023-01-04T16:00:00Z",
    },
  ]);
  const [sortKey, setSortKey] = useState<"reward" | "createdAt" | "none">(
    "none",
  );

  const sortedTodos = [...todos].sort((a, b) => {
    if (sortKey === "reward") {
      return b.reward - a.reward;
    }
    if (sortKey === "createdAt") {
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return 0;
  });
  const [input, setInput] = useState("");

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setTodos([
      ...todos,
      {
        id: crypto.randomUUID(),
        text,
        done: false,
        reward: 0,
        createdAt: new Date().toISOString(),
      },
    ]);
    setInput("");
  };

  const toggle = (id: string) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: string) => setTodos(todos.filter((t) => t.id !== id));

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-3xl font-bold">Todos</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="text-sm">
            Sort by:
          </label>
          <select
            id="sort-by"
            value={sortKey}
            onChange={(e) =>
              setSortKey(e.target.value as "reward" | "createdAt" | "none")
            }
            className="rounded border border-fg/20 bg-transparent px-2 py-1 text-sm"
          >
            <option value="none">None</option>
            <option value="reward">Highest Reward</option>
            <option value="createdAt">Newest First</option>
          </select>
          <Link href="/settings" className="text-sm text-accent hover:underline">
            settings
          </Link>
        </div>
      </header>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="What needs doing?"
          className="flex-1 rounded border border-fg/20 bg-transparent px-3 py-2"
        />
        <button
          onClick={add}
          className="rounded bg-accent px-4 py-2 font-medium text-bg"
        >
          add
        </button>
      </div>

      <ul>
        {sortedTodos.map((t) => (
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={toggle}
            onDelete={remove}
          />
        ))}
      </ul>
    </div>
  );
}
