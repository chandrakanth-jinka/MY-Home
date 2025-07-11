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
  const [checkingDb, setCheckingDb] = useState(true);

  useEffect(() => {
    if (loading) {
      return; // Wait for auth state to load
    }
    if (!user) {
      router.replace("/login");
      return;
    }

    const checkHousehold = async () => {
      setCheckingDb(true);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfile = userDocSnap.data() as UserProfile;
        if (userProfile.householdId) {
          router.replace("/dashboard");
        } else {
          router.replace("/household");
        }
      } else {
        // This case might happen if user doc creation failed after signup.
        // For simplicity, we'll route to household selection where they can trigger a doc creation.
        router.replace("/household");
      }
      setCheckingDb(false);
    };

    checkHousehold();
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading your space...</p>
    </div>
  );
}
