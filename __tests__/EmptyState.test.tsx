

import { render, screen } from "@testing-library/react";
import EmptyState from "@/components/EmptyState";
import { describe, it, expect } from "vitest";

describe("EmptyState", () => {
  it("renders the empty state message and button", () => {
    render(<EmptyState />);

    expect(screen.getByText("You don't have any projects yet.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Create Project/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Project/i })).toBeInTheDocument();
  });
});

