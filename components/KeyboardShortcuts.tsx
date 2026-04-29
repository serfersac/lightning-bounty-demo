"use client";

import { useEffect, useState } from "react";
import { handleKeydown, registerShortcut } from "@/lib/shortcuts";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useAuth } from "@/lib/auth/session";
import { ShortcutsHelp } from "./ShortcutsHelp";

export function KeyboardShortcuts() {
  const router = useRouter();
  const { user } = useAuth();
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    const cleanups = [
      registerShortcut({
        key: "p",
        description: "Go to Projects",
        action: () => router.push("/projects"),
      }),
      registerShortcut({
        key: "s",
        description: "Go to Stats",
        action: () => router.push("/stats"),
      }),
      registerShortcut({
        key: ",",
        description: "Go to Settings",
        action: () => router.push("/settings"),
      }),
      registerShortcut({
        key: "n",
        modifier: "ctrl",
        description: "New Task",
        action: () => user && setShowNewTaskModal(true),
      }),
      registerShortcut({
        key: "/",
        modifier: "ctrl",
        description: "Toggle Help",
        action: () => setShowHelpModal((s) => !s),
      }),
    ];

    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      cleanups.forEach((c) => c());
    };
  }, [router, user]);

  return (
    <>
      <Modal
        title="New Task"
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
      >
        <TaskForm
          projectId={user?.homeProjectId}
          onSuccess={() => setShowNewTaskModal(false)}
        />
      </Modal>
      <Modal
        title="Keyboard Shortcuts"
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      >
        <ShortcutsHelp />
      </Modal>
    </>
  );
}
