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
      try {
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
          // This can happen if the user document wasn't created on signup.
          // Send them to the household page to create/join, which also creates their user profile.
          router.replace("/household");
        }
      } catch (error) {
        console.error("Error checking user household:", error);
        // Fallback in case of an error
        router.replace("/login");
      } finally {
        setCheckingDb(false);
      }
    };

    checkHousehold();
  }, [user, loading, router]);

  // Don't render the loader if we are not actively checking the database
  // and the auth state is also loaded. This prevents a flash of the loader.
  if (loading || checkingDb) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your space...</p>
      </div>
    );
  }

  return null; // Render nothing while redirecting
}
