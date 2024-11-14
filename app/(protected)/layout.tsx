"use client";

import { useAuthCheck } from "@/hooks/use-auth-check";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthCheck();
  return <main className="container mx-auto mt-20">{children}</main>;
}