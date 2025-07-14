"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/types";
import { Loader2 } from "lucide-react";

export function AuthWrapper() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Wait a tick to allow useSyncHousehold to run
    setTimeout(() => {
      const houseId = localStorage.getItem("house_id");
      if (houseId) {
        router.replace("/dashboard");
      } else {
        router.replace("/household");
      }
      setChecking(false);
    }, 200); // 200ms delay to allow sync
  }, [user, loading, router]);

  if (loading || checking) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your space...</p>
      </div>
    );
  }

  return null;
}
