"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function UserInfo() {
  const { data: session, isPending } = useSession();

  const [progress, setProgress] = useState<{
    xp: number;
    rank: string;
    totalPoints: number;
    uniqueFishSpotted: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchProgress = async () => {
      if (!session) return;
      try {
        const res = await fetch(`/api/user/progress`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled) setProgress(json?.data ?? null);
      } catch (e) {
        // ignore
      }
    };

    fetchProgress();

    const handler = () => {
      fetchProgress();
    };
    // listen for global events triggered by actions that should refresh progress
    if (typeof window !== "undefined") {
      window.addEventListener("user:progress:updated", handler);
    }

    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("user:progress:updated", handler);
      }
    };
  }, [session]);

  if (isPending) {
    return <div className="text-text-secondary">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          redirect("/");
        },
      },
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-text-primary">
        <p className="font-medium">{session.user.name}</p>
        <p className="text-sm text-text-secondary">{session.user.email}</p>
        {progress ? (
          <p className="text-sm text-text-secondary mt-1">
            <span className="font-medium text-yellow-400">
              {progress.totalPoints || 0} pts
            </span>
            {" • "}
            <span className="font-medium text-sonar-green">
              {progress.xp}
            </span>{" "}
            XP
            {" • "}
            <span className="font-medium">{progress.rank}</span>
          </p>
        ) : (
          <p className="text-sm text-text-secondary mt-1">Loading stats...</p>
        )}
      </div>
      <button
        onClick={handleSignOut}
        className="px-4 py-2 bg-danger-red text-text-primary rounded-md hover:bg-danger-red/80 focus:outline-none focus:ring-2 focus:ring-danger-red transition"
      >
        Sign Out
      </button>
    </div>
  );
}
