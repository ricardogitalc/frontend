"use client";

import { useAuth } from "@/contexts/auth-context";
import { ProfileForm } from "@/components/auth/profile-form";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center">
      <ProfileForm user={user} />
    </div>
  );
}
