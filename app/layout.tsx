import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { SkipLink } from "@/components/ui/SkipLink";
import { AuthGuard } from "@/components/AuthGuard";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "Project Tracker",
  description: "Manage projects and tasks — Lightning Bounties demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SkipLink />
        <ToastProvider>
          <AuthGuard>{children}</AuthGuard>
          <ServiceWorkerRegistration />
        </ToastProvider>
      </body>
    </html>
  );
}
